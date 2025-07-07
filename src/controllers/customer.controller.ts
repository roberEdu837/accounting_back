import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
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
  response,
} from '@loopback/rest';
import {omit} from 'lodash';
import {Customer, CustomerUpdate} from '../models';
import {CustomerRepository} from '../repositories';
import {CustomerService} from '../services/customer.service';

@authenticate('jwt')
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

  @get('/customers')
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
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    return this.customerRepository.find(filter);
  }

  @get('/customers/associates')
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
  async find2(
    @param.filter(Customer) filter?: Filter<Customer>,
  ): Promise<Customer[]> {
    const customFilter: Filter<Customer> = {
      ...filter,
      where: {
        ...filter?.where,
        startOfRelationship: {
          gte: '2025-03-01T00:00:00Z',
        },
      },
    };
    return this.customerRepository.find(customFilter);
  }

  @patch('/customers')
  @response(200, {
    description: 'Customer PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CustomerUpdate, {partial: true}),
        },
      },
    })
    customer: CustomerUpdate,
    @param.where(Customer) where?: Where<Customer>,
  ): Promise<Count> {
    return this.customerRepository.updateAll(customer, where);
  }

  @get('/customers/{id}')
  @response(200, {
    description: 'Customer model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Customer, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Customer, {exclude: 'where'})
    filter?: FilterExcludingWhere<Customer>,
  ): Promise<Customer> {
    return this.customerRepository.findById(id, filter);
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
          schema: getModelSchemaRef(CustomerUpdate, {partial: true}),
        },
      },
    })
    customer: CustomerUpdate,
  ): Promise<void> {
    const customerUpdate = omit(customer, ['month']); // Elimina el campo 'month' del objeto customerUpdate
    const currentCustomer = await this.customerRepository.findById(id); // Obtiene el cliente actual por ID

    // checa si el honorario es mayor al actual
    if (customerUpdate.honorary > currentCustomer.honorary) {
      // Si es mayor, actualiza la contabilidad mensual y elimina los clientes en sociedad
      await this.customerService.editIfHonorarioGreaterThan(
        id,
        customer.month,
        customer.honorary,
        customer.periodicity,
      );
    }
    // Actualiza el cliente
    await this.customerRepository.updateById(id, customerUpdate);
  }
}
