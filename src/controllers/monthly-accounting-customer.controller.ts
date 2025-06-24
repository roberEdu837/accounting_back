import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  MonthlyAccounting,
  Customer,
} from '../models';
import {MonthlyAccountingRepository} from '../repositories';

export class MonthlyAccountingCustomerController {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
  ) { }

  @get('/monthly-accountings/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to MonthlyAccounting',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer),
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof MonthlyAccounting.prototype.id,
  ): Promise<Customer> {
    return this.monthlyAccountingRepository.customer(id);
  }
}
