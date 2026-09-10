import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Paymet} from '../models/paymet.model';
import {AccountingServiceRepository, ClientInSocietyRepository, PaymetRepository} from '../repositories';
import {PdfGeneratorService} from '../services/pdf.service';
// @authenticate('jwt')
export class PaymetController {
  constructor(
    @repository(PaymetRepository)
    public paymetRepository: PaymetRepository,

    @repository(AccountingServiceRepository)
    public accountingServiceRepository: AccountingServiceRepository,

    @inject('services.PdfGeneratorService')
    protected pdfService: PdfGeneratorService,

    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
  ) { }

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

  @get('/paymets/monthly-accounting/{monthlyAccountingId}')
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
  async findByMonthlyAccountingId(
    @param.path.number('monthlyAccountingId') monthlyAccountingId: number,
  ): Promise<Paymet[]> {
    return this.paymetRepository.find({
      where: {
        monthlyAccountingId: monthlyAccountingId,
      },
      include: [
        {
          relation: 'accountingService',
          scope: {
            include: [
              {
                relation: 'services',
              },
            ],
          },
        },
      ],
    });
  }

  @del('/paymets/{id}')
  @response(204, {
    description: 'Payment DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const payment = await this.paymetRepository.findById(id);

    if (!payment) {
      throw new HttpErrors.NotFound(`Pago con id ${id} no encontrado`);
    }

    const serviceId = payment.accountingServiceId;

    await this.paymetRepository.deleteById(id);
    await this.clientInSocietyRepository.deleteAll({
      paymetId: id,
    });

    if (serviceId) {
      const service = await this.accountingServiceRepository.findById(serviceId);

      const remainingPayments = await this.paymetRepository.find({
        where: {accountingServiceId: serviceId},
      });

      await this.accountingServiceRepository.updateById(serviceId, {
        status: 'PENDING',
      });
    }
  }
}
