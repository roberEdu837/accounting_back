import {Model, model, property} from '@loopback/repository';

@model()
export class CustomerUpdate extends Model {
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
    required: true,
  })
  status: boolean;

  @property({
    type: 'string',
    required: true,
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
  })
  startOfRelationship?: string;

  @property({
    type: 'number',
    required: true,
  })
  month: number;

  constructor(data?: Partial<CustomerUpdate>) {
    super(data);
  }
}

export interface CustomerUpdateRelations {
  // describe navigational properties here
}

export type CustomerUpdateWithRelations = CustomerUpdate &
  CustomerUpdateRelations;
