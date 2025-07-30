import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Passwords,
  Customer,
} from '../models';
import {PasswordsRepository} from '../repositories';

export class PasswordsCustomerController {
  constructor(
    @repository(PasswordsRepository)
    public passwordsRepository: PasswordsRepository,
  ) { }

  @get('/passwords/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to Passwords',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer),
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Passwords.prototype.id,
  ): Promise<Customer> {
    return this.passwordsRepository.customer(id);
  }
}
