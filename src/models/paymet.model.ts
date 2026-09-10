import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {AccountingService, AccountingServiceWithRelations} from './accounting-service.model';
import {ClientInSociety} from './client-in-society.model';

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
    type: 'string',
    required: true,
    mysql: {
      dataType: 'date',
      columnType: 'date',
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

  @hasOne(() => ClientInSociety)
  clientInSociety: ClientInSociety;

  @belongsTo(() => AccountingService)
  accountingServiceId?: number;

  constructor(data?: Partial<Paymet>) {
    super(data);
  }
}

export interface PaymetRelations {
  // describe navigational properties here
  accountingService?: AccountingServiceWithRelations;
}

export type PaymetWithRelations = Paymet & PaymetRelations;
