import {Entity, model, property} from '@loopback/repository';

export enum periodicity {
  MENSUAL = 'MENSUAL',
  BIMESTRAL = 'BIMESTRAL',
}

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  socialReason: string;

  @property({
    type: 'string',
    required: true,
  })
  rfc: string;

  @property({
    type: 'number',
    required: true,
  })
  honorary: number;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'boolean',
    default: true,
  })
  status?: boolean;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(periodicity),
    },
  })
  periodicity: string;

  @property({
    type: 'date',
    required: true,
  })
  creationDate: string;

  @property({
    type: 'date',
    required: true,
  })
  renewalDate: string;

  @property({
    type: 'date',
    required: false,
  })
  startOfRelationship: string;

  @property({
    type: 'boolean',
    default: false,
  })
  notificationSent?: boolean;
  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
