import {belongsTo, Entity, model, property} from '@loopback/repository';
import {MonthlyAccounting} from './monthly-accounting.model';

@model()
export class ClientInSociety extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string', // LoopBack lo maneja como texto
    required: false,
    mysql: {
      dataType: 'date', // 👈 usa 'dataType' en lugar de 'columnType'
      columnType: 'date', // 👈 opcional, refuerza que es DATE
    },
  })
  paymentDate: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  status: boolean;

  @property({
    type: 'number',
    required: false,
    default: 0,
  })
  amount: number;

  @belongsTo(() => MonthlyAccounting)
  monthlyAccountingId: number;

  @property({
    type: 'number',
  })
  paymetId?: number;

  constructor(data?: Partial<ClientInSociety>) {
    super(data);
  }
}

export interface ClientInSocietyRelations {
  monthlyAccounting?: MonthlyAccounting;
}

export type ClientInSocietyWithRelations = ClientInSociety &
  ClientInSocietyRelations;
