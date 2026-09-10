import {
  repository
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {AccountingService} from '../models';
import {AccountingServiceRepository, PaymetRepository} from '../repositories';

export class AccountingServiceController {
  constructor(
    @repository(AccountingServiceRepository)
    public accountingServiceRepository: AccountingServiceRepository,
    @repository(PaymetRepository)
    public paymetRepository: PaymetRepository
  ) { }

  @post('/accounting-services')
  @response(200, {
    description: 'AccountingService model instance',
    content: {'application/json': {schema: getModelSchemaRef(AccountingService)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountingService, {
            title: 'NewAccountingService',
            exclude: ['id'],
          }),
        },
      },
    })
    accountingService: Omit<AccountingService, 'id'>,
  ): Promise<AccountingService> {
    return this.accountingServiceRepository.create(accountingService);
  }

  @get('/accounting-services/monthly-accounting/{monthlyAccountingId}')
  @response(200, {
    description: 'Array of AccountingService model instances with payment calculations',
  })
  async findByMonthlyAccountingId(
    @param.path.number('monthlyAccountingId') monthlyAccountingId: number,
  ): Promise<any[]> {
    const accountingServices = await this.accountingServiceRepository.find({
      where: {
        monthlyAccountingId: monthlyAccountingId,
      },
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
        },
      ],
    });

    return accountingServices.map((service: any) => {
      const serviceObj = (service.toJSON ? service.toJSON() : service) as any;


      const allPayments = serviceObj.monthlyAccounting?.paymets || [];


      const servicePayments = allPayments.filter(
        (p: any) => p.accountingServiceId === service.id
      );

      const paidAmount = servicePayments.reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

      const debtAmount = Math.max(0, service.amount - paidAmount);


      return {
        id: service.id,
        description: service.services.description,
        name: service.services.name,
        amount: service.amount,
        status: service.status,
        monthlyAccountingId: service.monthlyAccountingId,
        servicesId: service.servicesId,
        paid: paidAmount,
        debt: debtAmount,
      };
    });
  }



  @patch('/accounting-services/{id}')
  @response(204, {
    description: 'AccountingService PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AccountingService, {partial: true}),
        },
      },
    })
    accountingService: Partial<AccountingService>,
  ): Promise<void> {
    await this.accountingServiceRepository.updateById(id, accountingService);
  }

  @del('/accounting-services/{id}')
  @response(204, {
    description: 'AccountingService and associated payments DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.paymetRepository.deleteAll({
      accountingServiceId: id,
    });

    await this.accountingServiceRepository.deleteById(id);
  }
}
