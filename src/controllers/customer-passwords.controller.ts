import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Customer,
  Passwords,
} from '../models';
import {CustomerRepository} from '../repositories';

export class CustomerPasswordsController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/passwords', {
    responses: {
      '200': {
        description: 'Array of Customer has many Passwords',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Passwords)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Passwords>,
  ): Promise<Passwords[]> {
    return this.customerRepository.passwords(id).find(filter);
  }

  @post('/customers/{id}/passwords', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Passwords)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Passwords, {
            title: 'NewPasswordsInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) passwords: Omit<Passwords, 'id'>,
  ): Promise<Passwords> {
    return this.customerRepository.passwords(id).create(passwords);
  }

  @patch('/customers/{id}/passwords', {
    responses: {
      '200': {
        description: 'Customer.Passwords PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Passwords, {partial: true}),
        },
      },
    })
    passwords: Partial<Passwords>,
    @param.query.object('where', getWhereSchemaFor(Passwords)) where?: Where<Passwords>,
  ): Promise<Count> {
    return this.customerRepository.passwords(id).patch(passwords, where);
  }

  @del('/customers/{id}/passwords', {
    responses: {
      '200': {
        description: 'Customer.Passwords DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Passwords)) where?: Where<Passwords>,
  ): Promise<Count> {
    return this.customerRepository.passwords(id).delete(where);
  }
}
