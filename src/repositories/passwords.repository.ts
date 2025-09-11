import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Passwords, PasswordsRelations} from '../models';

export class PasswordsRepository extends DefaultCrudRepository<
  Passwords,
  typeof Passwords.prototype.id,
  PasswordsRelations
> {
  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
  ) {
    super(Passwords, dataSource);
  }
}
