import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository, BelongsToAccessor} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {ClientInSociety, Paymet, PaymetRelations, AccountingService} from '../models';
import {ClientInSocietyRepository} from './client-in-society.repository';
import {AccountingServiceRepository} from './accounting-service.repository';

export class PaymetRepository extends DefaultCrudRepository<
  Paymet,
  typeof Paymet.prototype.id,
  PaymetRelations
> {

  public readonly clientInSociety: HasOneRepositoryFactory<ClientInSociety, typeof Paymet.prototype.id>;

  public readonly accountingService: BelongsToAccessor<AccountingService, typeof Paymet.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
    @repository.getter('ClientInSocietyRepository')
    protected clientInSocietyRepositoryGetter: Getter<ClientInSocietyRepository>, @repository.getter('AccountingServiceRepository') protected accountingServiceRepositoryGetter: Getter<AccountingServiceRepository>,
  ) {
    super(Paymet, dataSource);
    this.accountingService = this.createBelongsToAccessorFor('accountingService', accountingServiceRepositoryGetter,);
    this.registerInclusionResolver('accountingService', this.accountingService.inclusionResolver);

    this.clientInSociety = this.createHasOneRepositoryFactoryFor('clientInSociety', clientInSocietyRepositoryGetter);
    this.registerInclusionResolver('clientInSociety', this.clientInSociety.inclusionResolver);
  }
}
