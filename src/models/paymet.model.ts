import {Entity, model, property} from '@loopback/repository';

@model()
export class Paymet extends Entity {
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
  amount: number;

  @property({
    type: 'number',
  })
  monthlyAccountingId?: number;

  constructor(data?: Partial<Paymet>) {
    super(data);
  }
}

export interface PaymetRelations {
  // describe navigational properties here
}

export type PaymetWithRelations = Paymet & PaymetRelations;
