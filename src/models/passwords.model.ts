import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';

@model()
export class Passwords extends Entity {
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
  systemName: string;

  @property({
    type: 'string',
    required: true,
  })
  accessKey: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<Passwords>) {
    super(data);
  }
}

export interface PasswordsRelations {
  // describe navigational properties here
}

export type PasswordsWithRelations = Passwords & PasswordsRelations;
