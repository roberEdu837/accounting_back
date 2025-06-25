import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ClientInSociety,
  Customer,
} from '../models';
import {ClientInSocietyRepository} from '../repositories';

export class ClientInSocietyCustomerController {
  constructor(
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
  ) { }

  @get('/client-in-societies/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to ClientInSociety',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer),
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof ClientInSociety.prototype.id,
  ): Promise<Customer> {
    return this.clientInSocietyRepository.customer(id);
  }
}
