import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Customer, CustomerRelations, Passwords} from '../models';
import {PasswordsRepository} from './passwords.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {

  public readonly passwords: HasManyRepositoryFactory<Passwords, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource, @repository.getter('PasswordsRepository') protected passwordsRepositoryGetter: Getter<PasswordsRepository>,
  ) {
    super(Customer, dataSource);
    this.passwords = this.createHasManyRepositoryFactoryFor('passwords', passwordsRepositoryGetter,);
    this.registerInclusionResolver('passwords', this.passwords.inclusionResolver);
  }
}
