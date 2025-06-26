import {inject} from '@loopback/core';
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
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {Paymet} from '../models/paymet.model';
import {PaymetRepository} from '../repositories';
import {PdfGeneratorService} from '../services/pdf.service';
//@authenticate('jwt')
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

  @post('/statement')
  @response(200, {
    description: 'PDF generado',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async generatePdf(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              customerName: {type: 'string'},
              rfc: {type: 'string'},
              period: {type: 'string'},
              payments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    paymentDate: {type: 'string'},
                    amount: {type: 'number'},
                    // status: {type: 'string'},
                  },
                  required: ['paymentDate', 'amount'],
                },
              },
            },
            required: ['customerName', 'rfc', 'period', 'payments'],
          },
        },
      },
    })
    body: {
      customerName: string;
      rfc: string;
      period: string;
      payments: {paymentDate: string; amount: number}[];
    },
    @inject(RestBindings.Http.RESPONSE) res: Response,
  ): Promise<Response> {
    const pdfBuffer = await this.pdfService.generateAccountStatement(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="estado-cuenta.pdf"',
    );
    res.end(pdfBuffer);

    return res;
  }
}
