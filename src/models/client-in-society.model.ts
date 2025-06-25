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
    type: 'date',
    required: false,
    default: false,
  })
  paymentDate: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  status: boolean;

  @belongsTo(() => MonthlyAccounting)
  monthlyAccountingId: number;

  constructor(data?: Partial<ClientInSociety>) {
    super(data);
  }
}

export interface ClientInSocietyRelations {
  monthlyAccounting?: MonthlyAccounting;
}

export type ClientInSocietyWithRelations = ClientInSociety &
  ClientInSocietyRelations;
