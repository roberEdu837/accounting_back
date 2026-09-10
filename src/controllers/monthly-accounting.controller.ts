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
import {AccountingServiceRepository, CustomerRepository, MonthlyAccountingRepository, PaymetRepository} from '../repositories';
import {AccountingService} from '../services/accounting.service';
import {DebtCalculationService} from '../services/debt-calculation.service';
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
    @repository(AccountingServiceRepository)
    public accountingServiceRepository: AccountingServiceRepository,
    @repository(PaymetRepository)
    public paymentRepository: PaymetRepository,
    @service(AccountingService)
    public accountingService: AccountingService,
    @inject('services.PdfGeneratorService')
    protected pdfService: PdfGeneratorService,
    @inject('services.DebtCalculationService')
    protected calculator: DebtCalculationService

  ) { }

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
      where: {customerId: id, stateObligation: 'REALIZADO'},
      include: [{
        relation: 'paymets',
        scope: {
          where: {accountingServiceId: null}
        }
      }
      ],
    });

    const accountingServices = await this.accountingServiceRepository.find({
      where: {status: 'PENDING'},
      include: [
        {relation: 'services'},
        {
          relation: 'monthlyAccounting',
          scope: {
            include: [
              {
                relation: 'paymets',
                scope: {
                  where: {
                    accountingServiceId: {neq: null},
                  },
                },
              },
            ],
          },
        }]
    });

    const filterdServices = accountingServices.filter((item: any) => {
      return item.monthlyAccounting?.customerId == id && item.monthlyAccounting.stateObligation == 'REALIZADO'
    })

    const debtsServices = this.calculator.calculateServicesDebts(filterdServices);


    const totalDebtServices = debtsServices.reduce((acc, item) => acc + item.debt, 0);

    const customer = await this.customerRepository.findById(id);

    const calculateMonthlyDebts = this.calculator.calculateMonthlyDebts(accounting);

    const totalDebt = calculateMonthlyDebts.reduce(
      (sum, acc) => sum + acc.debt,
      0,
    );

    const totalPaid = calculateMonthlyDebts.reduce(
      (sum, acc) => sum + acc.totalPaid, 0
    )


    var total = totalDebt + totalDebtServices;
    const data: PaymentsPdfBody = {
      customer: {
        rfc: customer.rfc,
        socialReason: customer.socialReason,
        honorary: customer.honorary,
      },
      totalDebt: total,
      accountingForMonth: calculateMonthlyDebts,
      accountingServices: debtsServices,
      totalPaid
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

  // @post('/monthly-accountings/search')
  // @response(200, {
  //   description: 'Array of MonthlyAccounting model instances with paid and debt calculations',
  // })
  // async findFiltered(
  //   @requestBody(requestBodyFilterMonthlyAccounting)
  //   body: FilterDataMonthlyAccounting,
  // ): Promise<any[]> {
  //   const month = body.month;
  //   const search = body?.search?.trim();
  //   const year = body.year;
  //   const monthlyPaymentCompleted = body?.monthlyPaymentCompleted;

  //   let whereFilter: any = {};
  //   if (monthlyPaymentCompleted !== undefined) {
  //     whereFilter.monthlyPaymentCompleted = monthlyPaymentCompleted;
  //     whereFilter.stateObligation = 'REALIZADO';
  //   }

  //   if (month !== 0) {
  //     if (month % 2 === 0) {
  //       whereFilter.and = [
  //         {
  //           or: [
  //             {
  //               and: [{month: month}, {periodicity: 'BIMESTRAL'}],
  //             },
  //             {
  //               and: [{month: month - 1}, {periodicity: 'BIMESTRAL'}],
  //             },
  //             {
  //               and: [{month: month}, {periodicity: {neq: 'BIMESTRAL'}}],
  //             },
  //           ],
  //         },
  //       ];
  //     } else {
  //       whereFilter.month = month;
  //     }
  //   }

  //   if (year !== 0) whereFilter.year = year;

  //   const filter: Filter<MonthlyAccounting> = {
  //     where: whereFilter,
  //     include: [
  //       {
  //         relation: 'customer',
  //         scope: {
  //           include: [
  //             {
  //               relation: 'passwords',
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         relation: 'paymets',
  //         // scope: {
  //         //   where: {
  //         //     accountingServiceId: null,
  //         //   },
  //         // },
  //       },
  //     ],
  //     order: ['RfcTaxPaymentDate ASC'],
  //   };

  //   let results = await this.monthlyAccountingRepository.find(filter);

  //   let services = await this.accountingServiceRepository.find(

  //   )


  //   if (search) {
  //     results = results.filter(item => {
  //       const rfc = item.customer?.rfc?.toLowerCase() ?? '';
  //       const name = item.customer?.socialReason?.toLowerCase() ?? '';
  //       return (
  //         rfc.includes(search.toLowerCase()) ||
  //         name.includes(search.toLowerCase())
  //       );
  //     });
  //   }


  //   return results.map((item: any) => {
  //     const itemObj = item.toJSON ? item.toJSON() : item;

  //     const paid = (itemObj.paymets || []).reduce(
  //       (acc: number, payment: any) => acc + (payment.amount || 0),
  //       0,
  //     );

  //     const debt = Math.max(0, (itemObj.honorary || 0) - paid);

  //     return {
  //       ...itemObj,
  //       paid,
  //       debt,
  //     };
  //   });
  // }

  @post('/monthly-accountings/search')
  @response(200, {
    description: 'Array of MonthlyAccounting model instances with paid and debt calculations',
  })
  async findFiltered(
    @requestBody(requestBodyFilterMonthlyAccounting)
    body: FilterDataMonthlyAccounting,
  ): Promise<any[]> {
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

    // 1. Consultar las contabilidades con sus clientes y pagos realizados
    const filter: Filter<MonthlyAccounting> = {
      where: whereFilter,
      include: [
        {
          relation: 'customer',
          scope: {
            include: [{relation: 'passwords'}],
          },
        },
        {
          relation: 'paymets',
        },
      ],
      order: ['RfcTaxPaymentDate ASC'],
    };

    let results = await this.monthlyAccountingRepository.find(filter);

    if (search) {
      results = results.filter(item => {
        const rfc = item.customer?.rfc?.toLowerCase() ?? '';
        const name = item.customer?.socialReason?.toLowerCase() ?? '';
        return (
          rfc.includes(search.toLowerCase()) ||
          name.includes(search.toLowerCase())
        );
      });
    }

    if (results.length === 0) return [];

    // 2. Extraer los IDs de las contabilidades para buscar TODOS sus servicios
    const monthlyIds = results
      .map(item => item.id)
      .filter((id): id is number => id !== undefined);

    // 3. Buscar todos los servicios adicionales asignados a estas contabilidades (tengan pago o no)
    const allServices = await this.accountingServiceRepository.find({
      where: {
        monthlyAccountingId: {inq: monthlyIds},
      },
    });

    // 4. Mapear y calcular los pagos y deudas
    return results.map((item: any) => {
      const itemObj = item.toJSON ? item.toJSON() : item;
      const payments = itemObj.paymets || [];

      // Obtener los servicios correspondientes a este registro de contabilidad
      const itemServices = allServices.filter(
        s => s.monthlyAccountingId === itemObj.id,
      );

      // Mapear los servicios asignando sus pagos correspondientes si existen
      const servicesWithPayments = itemServices.map(service => {
        const servicePayments = payments.filter(
          (p: any) => p.accountingServiceId === service.id,
        );
        const paidServiceAmount = servicePayments.reduce(
          (acc: number, p: any) => acc + (p.amount || 0),
          0,
        );
        return {
          ...service,
          paid: paidServiceAmount,
          debt: Math.max(0, (service.amount || 0) - paidServiceAmount),
        };
      });

      // A. Totales de Contabilidad Mensual
      const honoraryAmount = itemObj.honorary || 0;
      const paidAccounting = payments
        .filter((p: any) => !p.accountingServiceId)
        .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
      const debtAccounting = Math.max(0, honoraryAmount - paidAccounting);

      // B. Totales de Servicios Adicionales (calculados directamente de la tabla accountingService)
      const servicesAmount = itemServices.reduce(
        (acc: number, s: any) => acc + (s.amount || 0),
        0,
      );
      const paidServices = payments
        .filter((p: any) => p.accountingServiceId !== null && p.accountingServiceId !== undefined)
        .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
      const debtServices = Math.max(0, servicesAmount - paidServices);

      // C. Totales Consolidados (Contabilidad + Servicios)
      const totalToPay = honoraryAmount + servicesAmount;
      const paid = paidAccounting + paidServices;
      const debt = Math.max(0, totalToPay - paid);

      return {
        ...itemObj,
        accountingServices: servicesWithPayments,
        paid,
        debt,
        totalToPay,
        paidAccounting,
        paidServices,
        debtAccounting,
        debtServices,
      };
    });
  }

}
