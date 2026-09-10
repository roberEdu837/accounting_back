import {belongsTo, Entity, model, property} from '@loopback/repository';
import {MonthlyAccounting} from './monthly-accounting.model';
import {Services} from './services.model';

@model()
export class AccountingService extends Entity {
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
    default: 'PENDING',
  })
  status?: string;

  @belongsTo(() => MonthlyAccounting)
  monthlyAccountingId: number;

  @belongsTo(() => Services)
  servicesId: number;

  constructor(data?: Partial<AccountingService>) {
    super(data);
  }
}

export interface AccountingServiceRelations {
  // describe navigational properties here
}

export type AccountingServiceWithRelations = AccountingService & AccountingServiceRelations;
