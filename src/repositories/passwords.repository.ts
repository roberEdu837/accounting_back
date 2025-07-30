import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Passwords, PasswordsRelations, Customer} from '../models';
import {CustomerRepository} from './customer.repository';

export class PasswordsRepository extends DefaultCrudRepository<
  Passwords,
  typeof Passwords.prototype.id,
  PasswordsRelations
> {

  public readonly customer: BelongsToAccessor<Customer, typeof Passwords.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Passwords, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
