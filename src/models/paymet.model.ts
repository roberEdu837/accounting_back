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
    type: 'string', // LoopBack lo maneja como texto
    required: true,
    mysql: {
      dataType: 'date', // 👈 usa 'dataType' en lugar de 'columnType'
      columnType: 'date', // 👈 opcional, refuerza que es DATE
    },
  })
  paymentDate: string;

  @property({
    type: 'number',
  })
  monthlyAccountingId?: number;

  @property({
    type: 'number',
    required: true,
  })
  paymentMethod: number;

  constructor(data?: Partial<Paymet>) {
    super(data);
  }
}

export interface PaymetRelations {
  // describe navigational properties here
}

export type PaymetWithRelations = Paymet & PaymetRelations;
