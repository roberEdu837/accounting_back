import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Paymet, PaymetRelations} from '../models';

export class PaymetRepository extends DefaultCrudRepository<
  Paymet,
  typeof Paymet.prototype.id,
  PaymetRelations
> {
  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
  ) {
    super(Paymet, dataSource);
  }
}
