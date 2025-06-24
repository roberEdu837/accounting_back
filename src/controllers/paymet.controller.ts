import {authenticate} from '@loopback/authentication';
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
import {Paymet} from '../models/paymet.model';
import {PaymetRepository} from '../repositories';
@authenticate('jwt')
export class PaymetController {
  constructor(
    @repository(PaymetRepository)
    public paymetRepository: PaymetRepository,
  ) {}

  @post('/paymets')
  @response(200, {
    description: 'Paymet model instance',
    content: {'application/json': {schema: getModelSchemaRef(Paymet)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paymet, {
            title: 'NewPaymet',
            exclude: ['id'],
          }),
        },
      },
    })
    paymet: Omit<Paymet, 'id'>,
  ): Promise<Paymet> {
    return this.paymetRepository.create(paymet);
  }

  @get('/paymets')
  @response(200, {
    description: 'Array of Paymet model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Paymet, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Paymet) filter?: Filter<Paymet>): Promise<Paymet[]> {
    return this.paymetRepository.find(filter);
  }

  @patch('/paymets')
  @response(200, {
    description: 'Paymet PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paymet, {partial: true}),
        },
      },
    })
    paymet: Paymet,
    @param.where(Paymet) where?: Where<Paymet>,
  ): Promise<Count> {
    return this.paymetRepository.updateAll(paymet, where);
  }

  @get('/paymets/{id}')
  @response(200, {
    description: 'Paymet model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Paymet, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Paymet, {exclude: 'where'})
    filter?: FilterExcludingWhere<Paymet>,
  ): Promise<Paymet> {
    return this.paymetRepository.findById(id, filter);
  }

  @patch('/paymets/{id}')
  @response(204, {
    description: 'Paymet PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paymet, {partial: true}),
        },
      },
    })
    paymet: Paymet,
  ): Promise<void> {
    await this.paymetRepository.updateById(id, paymet);
  }
}
