import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Services, ServicesRelations} from '../models';

export class ServicesRepository extends DefaultCrudRepository<
  Services,
  typeof Services.prototype.id,
  ServicesRelations
> {
  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
  ) {
    super(Services, dataSource);
  }
}
