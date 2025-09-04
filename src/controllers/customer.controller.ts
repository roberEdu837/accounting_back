import {service} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Customer} from '../models';
import {CustomerRepository} from '../repositories';
import {CustomerService} from '../services/customer.service';
import {
  FilterDataCustomer,
  requestBodyFilterCustomer,
} from '../specs/customer.spec';

// @authenticate('jwt')
export class CustomerController {
  constructor(
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @service(CustomerService)
    public customerService: CustomerService,
  ) {}

  @post('/customers')
  @response(200, {
    description: 'Customer model instance',
    content: {'application/json': {schema: getModelSchemaRef(Customer)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {
            title: 'NewCustomer',
            exclude: ['id'],
          }),
        },
      },
    })
    customer: Omit<Customer, 'id'>,
  ): Promise<Customer> {
    return this.customerRepository.create(customer);
  }

  @post('/customers/search')
  @response(200, {
    description: 'Array of Customer model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Customer, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @requestBody(requestBodyFilterCustomer)
    body: FilterDataCustomer,
  ): Promise<Customer[]> {
    let whereFilter: any = {};

    const search = body?.search?.trim();
    const isInSociety = body?.isInSociety;

    if (search) {
      whereFilter.or = [
        {socialReason: {like: `%${search}%`, options: 'i'}},
        {rfc: {like: `%${search}%`, options: 'i'}},
      ];
    }

    if (isInSociety !== undefined) {
      whereFilter.isInSociety = isInSociety;
    }

    const filter: Filter<Customer> = {
      where: whereFilter,
      order: ['socialReason ASC'],
    };

    return this.customerRepository.find(filter);
  }

  @patch('/customers/{id}')
  @response(204, {
    description: 'Customer PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {partial: true}),
        },
      },
    })
    customer: Customer,
  ): Promise<void> {
    await this.customerRepository.updateById(id, customer);
  }
}
