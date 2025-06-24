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
import {MonthlyAccounting} from '../models';
import {Paymet} from '../models/paymet.model';
import {MonthlyAccountingRepository} from '../repositories';

export class MonthlyAccountingPaymetController {
  constructor(
    @repository(MonthlyAccountingRepository)
    protected monthlyAccountingRepository: MonthlyAccountingRepository,
  ) {}

  @get('/monthly-accountings/{id}/paymets', {
    responses: {
      '200': {
        description: 'Array of MonthlyAccounting has many Paymet',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Paymet)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Paymet>,
  ): Promise<Paymet[]> {
    return this.monthlyAccountingRepository.paymets(id).find(filter);
  }

  @post('/monthly-accountings/{id}/paymets', {
    responses: {
      '200': {
        description: 'MonthlyAccounting model instance',
        content: {'application/json': {schema: getModelSchemaRef(Paymet)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof MonthlyAccounting.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paymet, {
            title: 'NewPaymetInMonthlyAccounting',
            exclude: ['id'],
            optional: ['monthlyAccountingId'],
          }),
        },
      },
    })
    paymet: Omit<Paymet, 'id'>,
  ): Promise<Paymet> {
    return this.monthlyAccountingRepository.paymets(id).create(paymet);
  }

  @patch('/monthly-accountings/{id}/paymets', {
    responses: {
      '200': {
        description: 'MonthlyAccounting.Paymet PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Paymet, {partial: true}),
        },
      },
    })
    paymet: Partial<Paymet>,
    @param.query.object('where', getWhereSchemaFor(Paymet))
    where?: Where<Paymet>,
  ): Promise<Count> {
    return this.monthlyAccountingRepository.paymets(id).patch(paymet, where);
  }

  @del('/monthly-accountings/{id}/paymets', {
    responses: {
      '200': {
        description: 'MonthlyAccounting.Paymet DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Paymet))
    where?: Where<Paymet>,
  ): Promise<Count> {
    return this.monthlyAccountingRepository.paymets(id).delete(where);
  }
}
