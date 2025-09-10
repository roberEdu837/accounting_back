import {Filter, repository} from '@loopback/repository';
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
import {
  ClientInSocietyRepository,
  MonthlyAccountingRepository,
} from '../repositories';
import {
  FilterDataClientInSociety,
  requestBodyFilterClientInSociety,
} from '../specs/client-in-society.spec';

export class ClientInSocietyController {
  constructor(
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
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
    const accounting = await this.monthlyAccountingRepository.findById(
      clientInSociety.monthlyAccountingId,
    );

    // Buscar registros existentes
    const clientsInSociety = await this.clientInSocietyRepository.find({
      where: {
        monthlyAccountingId: clientInSociety.monthlyAccountingId,
      },
    });

    // Si ya existen registros, calculamos lo restante
    if (clientsInSociety.length > 0) {
      const totalAssigned = clientsInSociety.reduce(
        (sum, client) => sum + (client.amount ?? 0),
        0,
      );

      // Ajustar el amount para el nuevo registro
      clientInSociety.amount = accounting.honorary - totalAssigned;
    } else {
      // Si no hay registros, el amount es igual al honorario completo
      clientInSociety.amount = accounting.honorary;
    }

    // Crear el nuevo registro
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
    @requestBody(requestBodyFilterClientInSociety)
    body: FilterDataClientInSociety,
  ): Promise<ClientInSociety[]> {
    const {month, year, search, monthlyPaymentCompleted} = body ?? {};

    const where: any = {};
    if (monthlyPaymentCompleted !== undefined) {
      where.status = monthlyPaymentCompleted;
    }

    let monthlyWhere: any = {stateObligation: 'REALIZADO', isInSociety: true}; // 👈 solo contabilidades realizadas

    if (month !== 0) {
      if (month % 2 === 0) {
        monthlyWhere.and = [
          {
            or: [
              {and: [{month}, {periodicity: 'BIMESTRAL'}]},
              {and: [{month: month - 1}, {periodicity: 'BIMESTRAL'}]},
              {and: [{month}, {periodicity: {neq: 'BIMESTRAL'}}]},
            ],
          },
        ];
      } else {
        monthlyWhere = {...monthlyWhere, month};
      }
    }

    if (year !== 0) {
      monthlyWhere = {...monthlyWhere, year};
    }

    const filter: Filter<ClientInSociety> = {
      where,
      order: ['status ASC'],
      include: [
        {
          relation: 'monthlyAccounting',
          scope: {
            where: monthlyWhere,
            include: [
              {
                relation: 'customer',
                scope: {
                  where: {
                    ...(search
                      ? {
                          or: [
                            {rfc: {like: `%${search}%`}},
                            {socialReason: {like: `%${search}%`}},
                          ],
                        }
                      : {}),
                  },
                },
              },
            ],
          },
        },
      ],
    };

    const results = await this.clientInSocietyRepository.find(filter);

    return results.filter(
      item => item.monthlyAccounting && item.monthlyAccounting.customer,
    );
  }

  @get('/client-in-societies/associated-debts')
  @response(200, {
    description: 'Valida si existe deuda con asociados',
  })
  async findByStatus(): Promise<boolean> {
    const associated = await this.clientInSocietyRepository.find({
      where: {
        status: false,
      },
    });

    if (associated.length > 0) {
      return true;
    }
    return false;
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
