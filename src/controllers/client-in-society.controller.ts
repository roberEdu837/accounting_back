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
import {ClientInSociety} from '../models';
import {ClientInSocietyRepository} from '../repositories';

export class ClientInSocietyController {
  constructor(
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
  ) {}

  @post('/client-in-societies')
  @response(200, {
    description: 'ClientInSociety model instance',
    content: {'application/json': {schema: getModelSchemaRef(ClientInSociety)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClientInSociety, {
            title: 'NewClientInSociety',
            exclude: ['id'],
          }),
        },
      },
    })
    clientInSociety: Omit<ClientInSociety, 'id'>,
  ): Promise<ClientInSociety> {
    const {monthlyAccountingId} = clientInSociety;

    const existing = await this.clientInSocietyRepository.findOne({
      where: {monthlyAccountingId},
      include: [
        {
          relation: 'monthlyAccounting',
          scope: {
            include: [
              {
                relation: 'customer',
              },
            ],
          },
        },
      ],
    });

    if (existing) {
      console.log('Ya existe un registro para este cliente en este mes');
      throw new Error('Ya existe un registro para este cliente en este mes');
    }

    return this.clientInSocietyRepository.create(clientInSociety);
  }

  @post('/client-in-societies/search')
  @response(200, {
    description: 'Array of ClientInSociety model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ClientInSociety, {includeRelations: true}),
        },
      },
    },
  })
  async findFilteredClientInSociety(
    @requestBody({
      required: false,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              month: {type: 'number'},
              search: {type: 'string'},
              year: {type: 'number'},
            },
          },
        },
      },
    })
    body?: {
      month?: number;
      search?: string;
      year?: number;
    },
  ): Promise<ClientInSociety[]> {
    const month = body?.month;
    const year = body?.year;
    const search = body?.search?.trim().toLowerCase();

    const filter: Filter<ClientInSociety> = {
      include: [
        {
          relation: 'monthlyAccounting',
          scope: {
            where:
              month !== undefined && year !== undefined
                ? month % 2 === 0
                  ? {
                      and: [
                        {year: year},
                        {or: [{month: month}, {month: month - 1}]},
                      ],
                    }
                  : {month, year}
                : year !== undefined
                  ? {year}
                  : undefined,
            include: [
              {
                relation: 'customer',
              },
            ],
          },
        },
      ],
    };

    const results = await this.clientInSocietyRepository.find(filter);

    // Filtro adicional en memoria para asegurar match con contabilidad
    const filteredResults = results.filter(item => {
      const accounting = item.monthlyAccounting;
      if (!accounting) return false;

      if (month !== undefined && year !== undefined) {
        if (month % 2 === 0) {
          return (
            accounting.year === year &&
            (accounting.month === month || accounting.month === month - 1)
          );
        } else {
          return accounting.month === month && accounting.year === year;
        }
      } else if (year !== undefined) {
        return accounting.year === year;
      }

      return true;
    });

    if (search) {
      return filteredResults.filter(item => {
        const rfc = item.monthlyAccounting?.customer?.rfc ?? '';
        const name =
          item.monthlyAccounting?.customer?.socialReason?.toLowerCase() ?? '';
        return rfc.includes(search) || name.includes(search);
      });
    }

    return filteredResults;
  }

  @patch('/client-in-societies')
  @response(200, {
    description: 'ClientInSociety PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClientInSociety, {partial: true}),
        },
      },
    })
    clientInSociety: ClientInSociety,
    @param.where(ClientInSociety) where?: Where<ClientInSociety>,
  ): Promise<Count> {
    return this.clientInSocietyRepository.updateAll(clientInSociety, where);
  }

  @get('/client-in-societies/{id}')
  @response(200, {
    description: 'ClientInSociety model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ClientInSociety, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ClientInSociety, {exclude: 'where'})
    filter?: FilterExcludingWhere<ClientInSociety>,
  ): Promise<ClientInSociety> {
    return this.clientInSocietyRepository.findById(id, filter);
  }

  @patch('/client-in-societies/{id}')
  @response(204, {
    description: 'ClientInSociety PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ClientInSociety, {partial: true}),
        },
      },
    })
    clientInSociety: ClientInSociety,
  ): Promise<void> {
    await this.clientInSocietyRepository.updateById(id, clientInSociety);
  }
}
