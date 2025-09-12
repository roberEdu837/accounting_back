import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {Paymet, PaymetRelations, ClientInSociety} from '../models';
import {ClientInSocietyRepository} from './client-in-society.repository';

export class PaymetRepository extends DefaultCrudRepository<
  Paymet,
  typeof Paymet.prototype.id,
  PaymetRelations
> {

  public readonly clientInSociety: HasOneRepositoryFactory<ClientInSociety, typeof Paymet.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource, @repository.getter('ClientInSocietyRepository') protected clientInSocietyRepositoryGetter: Getter<ClientInSocietyRepository>,
  ) {
    super(Paymet, dataSource);
    this.clientInSociety = this.createHasOneRepositoryFactoryFor('clientInSociety', clientInSocietyRepositoryGetter);
    this.registerInclusionResolver('clientInSociety', this.clientInSociety.inclusionResolver);
  }
}
