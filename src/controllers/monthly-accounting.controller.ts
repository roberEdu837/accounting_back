import {inject, service} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {MonthlyAccounting} from '../models';
import {CustomerRepository, MonthlyAccountingRepository} from '../repositories';
import {AccountingService} from '../services/accounting.service';
import {PdfGeneratorService} from '../services/pdf.service';
import {
  FilterDataMonthlyAccounting,
  PaymentsPdfBody,
  requestBodyFilterMonthlyAccounting,
} from '../specs/monthly-accounting.spec';
//@authenticate('jwt')
export class MonthlyAccountingController {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @service(AccountingService)
    public accountingService: AccountingService,
    @inject('services.PdfGeneratorService')
    protected pdfService: PdfGeneratorService,
  ) {}

  @post('/monthly-accountings/generate')
  @response(200, {
    description: 'MonthlyAccounting model instance',
    content: {
      'application/json': {schema: getModelSchemaRef(MonthlyAccounting)},
    },
  })
  async create(): Promise<void> {
    const customers = await this.customerRepository.find({
      fields: {
        id: true,
        periodicity: true,
        honorary: true,
        rfc: true,
        isInSociety: true,
      },
      where: {
        status: true,
      },
    });

    for (const customer of customers) {
      await this.accountingService.generateMonthlyAccounting(
        customer.id,
        customer.periodicity,
        customer.honorary,
        customer.rfc,
        customer.isInSociety,
      );
    }
  }

  @get('/monthly-accountings/debts/customer/{id}/pdf')
  @response(200, {
    description: 'Estado de deudas en PDF',
    content: {
      'application/pdf': {
        schema: {type: 'string', format: 'binary'},
      },
    },
  })
  async getDebts(
    @param.path.number('id') id: number,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Response> {
    const accounting = await this.monthlyAccountingRepository.find({
      where: {customerId: id},
      include: [{relation: 'paymets'}],
    });

    if (!accounting || accounting.length === 0) {
      res.status(404).send({error: 'No se encontró el registro'});
      return res;
    }

    const customer = await this.customerRepository.findById(id);

    const accountingForMonth = accounting
      .map(acc => {
        const totalPaid = (acc.paymets ?? []).reduce(
          (sum, p) => sum + (p.amount ?? 0),
          0,
        );

        const honorary = acc.honorary ?? 0;
        return {
          month: acc.month,
          debt: honorary - totalPaid,
          year: acc.year,
          periodicity: acc.periodicity,
          honorary,
        };
      })
      .filter(acc => acc.debt > 0);

    const totalDebt = accountingForMonth.reduce(
      (sum, acc) => sum + acc.debt,
      0,
    );

    const data: PaymentsPdfBody = {
      customer: {
        rfc: customer.rfc,
        socialReason: customer.socialReason,
        honorary: customer.honorary,
      },
      totalDebt,
      accountingForMonth: accountingForMonth,
    };

    const pdfBuffer = await this.pdfService.generatePaymentsStatement(data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="estado-de-deudas.pdf"',
    );
    res.end(pdfBuffer);

    return res;
  }

  @get('/monthly-accountings/has-debts')
  @response(200, {
    description:
      'Valida si existe alguna contabilidad con pagos incompletos y stateObligation REALIZADO',
    content: {
      'application/json': {
        schema: {type: 'boolean'},
      },
    },
  })
  async hasDebts(): Promise<any> {
    const accountings = await this.monthlyAccountingRepository.find({
      where: {stateObligation: 'REALIZADO'},
      include: [{relation: 'paymets'}],
    });

    for (const acc of accountings) {
      const totalPagado = (acc.paymets ?? []).reduce(
        (sum, p) => sum + (p.amount ?? 0),
        0,
      );

      if (totalPagado < (acc.honorary ?? 0)) {
        return true;
      }
    }
    return false;
  }

  @patch('/monthly-accountings/{id}')
  @response(204, {
    description: 'MonthlyAccounting PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MonthlyAccounting, {partial: true}),
        },
      },
    })
    monthlyAccounting: MonthlyAccounting,
  ): Promise<void> {
    await this.monthlyAccountingRepository.updateById(id, monthlyAccounting);
  }

  @post('/monthly-accountings/search')
  @response(200, {
    description: 'Array of MonthlyAccounting model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MonthlyAccounting, {includeRelations: true}),
        },
      },
    },
  })
  async findFiltered(
    @requestBody(requestBodyFilterMonthlyAccounting)
    body: FilterDataMonthlyAccounting,
  ): Promise<MonthlyAccounting[]> {
    const month = body.month;
    const search = body?.search?.trim();
    const year = body.year;
    const monthlyPaymentCompleted = body?.monthlyPaymentCompleted;

    let whereFilter: any = {};
    if (monthlyPaymentCompleted !== undefined) {
      whereFilter.monthlyPaymentCompleted = monthlyPaymentCompleted;
      whereFilter.stateObligation = 'REALIZADO';
    }

    if (month !== 0) {
      if (month % 2 === 0) {
        whereFilter.and = [
          {
            or: [
              {
                and: [{month: month}, {periodicity: 'BIMESTRAL'}],
              },
              {
                and: [{month: month - 1}, {periodicity: 'BIMESTRAL'}],
              },
              {
                and: [{month: month}, {periodicity: {neq: 'BIMESTRAL'}}],
              },
            ],
          },
        ];
      } else {
        whereFilter.month = month;
      }
    }

    if (year !== 0) whereFilter.year = year;

    const filter: Filter<MonthlyAccounting> = {
      where: whereFilter,
      include: [
        {
          relation: 'customer',
          scope: {
            include: [
              {
                relation: 'passwords',
              },
            ],
          },
        },
        {
          relation: 'paymets',
        },
      ],
      order: ['RfcTaxPaymentDate ASC'],
    };

    const results = await this.monthlyAccountingRepository.find(filter);

    if (search) {
      return results.filter(item => {
        const rfc = item.customer?.rfc?.toLowerCase() ?? '';
        const name = item.customer?.socialReason?.toLowerCase() ?? '';
        return (
          rfc.includes(search.toLowerCase()) ||
          name.includes(search.toLowerCase())
        );
      });
    }

    return results;
  }
}
