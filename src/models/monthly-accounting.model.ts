import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Customer, periodicity} from './customer.model';
import {Paymet} from './paymet.model';

export enum stateObligation {
  PENDIENTE = 'PENDIENTE',
  REALIZADO = 'REALIZADO',
  INCONCLUSO = 'INCONCLUSO',
}

@model()
export class MonthlyAccounting extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  month: number;

  @property({
    type: 'number',
    required: true,
  })
  year: number;

  @property({
    type: 'string',
    required: true,
    default: stateObligation.PENDIENTE,
    jsonSchema: {
      enum: Object.values(stateObligation),
    },
  })
  stateObligation: string;

  @property({
    type: 'number',
    required: true,
  })
  honorary: number;

  @property({
    type: 'string',
    required: false,
    jsonSchema: {
      enum: Object.values(periodicity),
    },
  })
  periodicity: string;

  @property({
    type: 'date',
    required: true,
  })
  rfcTaxPaymentDate: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  isInSociety: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  monthlyPaymentCompleted: boolean;

  @belongsTo(() => Customer)
  customerId: number;

  customer?: Customer;

  @hasMany(() => Paymet)
  paymets: Paymet[];

  constructor(data?: Partial<MonthlyAccounting>) {
    super(data);
  }
}

// ✅ Relaciones declaradas correctamente
export interface MonthlyAccountingRelations {
  customer?: Customer;
}

export type MonthlyAccountingWithRelations = MonthlyAccounting &
  MonthlyAccountingRelations;
