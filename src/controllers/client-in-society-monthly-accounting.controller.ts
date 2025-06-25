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
  MonthlyAccounting,
} from '../models';
import {ClientInSocietyRepository} from '../repositories';

export class ClientInSocietyMonthlyAccountingController {
  constructor(
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
  ) { }

  @get('/client-in-societies/{id}/monthly-accounting', {
    responses: {
      '200': {
        description: 'MonthlyAccounting belonging to ClientInSociety',
        content: {
          'application/json': {
            schema: getModelSchemaRef(MonthlyAccounting),
          },
        },
      },
    },
  })
  async getMonthlyAccounting(
    @param.path.number('id') id: typeof ClientInSociety.prototype.id,
  ): Promise<MonthlyAccounting> {
    return this.clientInSocietyRepository.monthlyAccounting(id);
  }
}
