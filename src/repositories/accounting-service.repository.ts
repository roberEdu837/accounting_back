import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {AccountingService, AccountingServiceRelations, MonthlyAccounting, Services} from '../models';
import {MonthlyAccountingRepository} from './monthly-accounting.repository';
import {ServicesRepository} from './services.repository';

export class AccountingServiceRepository extends DefaultCrudRepository<
  AccountingService,
  typeof AccountingService.prototype.id,
  AccountingServiceRelations
> {

  public readonly monthlyAccounting: BelongsToAccessor<MonthlyAccounting, typeof AccountingService.prototype.id>;

  public readonly services: BelongsToAccessor<Services, typeof AccountingService.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource, @repository.getter('MonthlyAccountingRepository') protected monthlyAccountingRepositoryGetter: Getter<MonthlyAccountingRepository>, @repository.getter('ServicesRepository') protected servicesRepositoryGetter: Getter<ServicesRepository>,
  ) {
    super(AccountingService, dataSource);
    this.services = this.createBelongsToAccessorFor('services', servicesRepositoryGetter,);
    this.registerInclusionResolver('services', this.services.inclusionResolver);
    this.monthlyAccounting = this.createBelongsToAccessorFor('monthlyAccounting', monthlyAccountingRepositoryGetter,);
    this.registerInclusionResolver('monthlyAccounting', this.monthlyAccounting.inclusionResolver);
  }
}
