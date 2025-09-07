import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
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
  requestBodyPaymentsPdf,
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

  @post('/monthly-accountings')
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

  @get('/monthly-accountings/{id}')
  @response(200, {
    description: 'MonthlyAccounting model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MonthlyAccounting, {includeRelations: true}),
      },
    },
  })
  async findBy(
    @param.path.number('id') id: number,
    @param.filter(MonthlyAccounting, {exclude: 'where'})
    filter?: FilterExcludingWhere<MonthlyAccounting>,
  ): Promise<MonthlyAccounting> {
    return this.monthlyAccountingRepository.findById(id, filter);
  }

  @get('/monthly-accountings')
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
  async find(
    @param.filter(MonthlyAccounting) filter?: Filter<MonthlyAccounting>,
  ): Promise<MonthlyAccounting[]> {
    return this.monthlyAccountingRepository.find(filter);
  }

  @get('/monthly-accountings/debts/customer/{id}')
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
    const accounting = await this.monthlyAccountingRepository.findOne({
      where: {id},
      include: [{relation: 'paymets'}, {relation: 'customer'}],
    });

    if (!accounting) {
      res.status(404).send({error: 'No se encontró el registro'});
      return res;
    }

    // calcular balance con los pagos
    let balance = accounting.honorary ?? 0;
    const paymentsWithBalance = (accounting.paymets ?? []).map(payment => {
      balance -= payment.amount ?? 0;
      return {
        ...payment,
        balance,
        honorary: accounting.honorary,
      };
    });

    const result = {
      ...accounting,
      paymets: paymentsWithBalance,
    };

    console.log(result);

    const pdfBuffer = await this.pdfService.generatePaymentsStatement(result);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="estado-de-deudas.pdf"',
    );
    res.end(pdfBuffer);

    return res; // ya no hay segundo return
  }

  @patch('/monthly-accountings')
  @response(200, {
    description: 'MonthlyAccounting PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MonthlyAccounting, {partial: true}),
        },
      },
    })
    monthlyAccounting: MonthlyAccounting,
    @param.where(MonthlyAccounting) where?: Where<MonthlyAccounting>,
  ): Promise<Count> {
    return this.monthlyAccountingRepository.updateAll(monthlyAccounting, where);
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
    // Traemos todas las contabilidades con stateObligation REALIZADO y sus pagos
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
        return true; // apenas encuentre una con deuda, devolvemos true
      }
    }
    return false; // si ninguna tiene deuda
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
        // Agrupa el año con el OR de los meses
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

    if (year !== 0) {
      whereFilter.year = year;
    }

    const filter: Filter<MonthlyAccounting> = {
      where: whereFilter,
      include: [
        {
          relation: 'customer',
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

  @post('/monthly-accountings/debts')
  @response(200, {
    description: 'PDF generado',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generatePdf(
    @requestBody(requestBodyPaymentsPdf)
    body: PaymentsPdfBody,
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Response> {
    const pdfBuffer = await this.pdfService.generatePaymentsStatement(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="estado-de-deudas.pdf"',
    );
    res.end(pdfBuffer);

    return res;
  }
}
