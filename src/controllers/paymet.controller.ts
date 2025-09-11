import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Paymet} from '../models/paymet.model';
import {PaymetRepository} from '../repositories';
import {PdfGeneratorService} from '../services/pdf.service';
@authenticate('jwt')
export class PaymetController {
  constructor(
    @repository(PaymetRepository)
    public paymetRepository: PaymetRepository,
    @inject('services.PdfGeneratorService')
    protected pdfService: PdfGeneratorService,
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

  @del('/paymets/{id}')
  @response(204, {
    description: 'Paymet DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.paymetRepository.deleteById(id);
  }
}
