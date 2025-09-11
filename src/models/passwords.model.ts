import {Entity, model, property} from '@loopback/repository';

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
    required: false,
  })
  password: string;

  @property({
    type: 'number',
  })
  customerId?: number;

  constructor(data?: Partial<Passwords>) {
    super(data);
  }
}

export interface PasswordsRelations {
  // describe navigational properties here
}

export type PasswordsWithRelations = Passwords & PasswordsRelations;
