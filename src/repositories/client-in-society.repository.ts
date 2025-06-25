import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {ClientInSociety, ClientInSocietyRelations, Customer, MonthlyAccounting} from '../models';
import {CustomerRepository} from './customer.repository';
import {MonthlyAccountingRepository} from './monthly-accounting.repository';

export class ClientInSocietyRepository extends DefaultCrudRepository<
  ClientInSociety,
  typeof ClientInSociety.prototype.id,
  ClientInSocietyRelations
> {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof ClientInSociety.prototype.id
  >;

  public readonly monthlyAccounting: BelongsToAccessor<MonthlyAccounting, typeof ClientInSociety.prototype.id>;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>, @repository.getter('MonthlyAccountingRepository') protected monthlyAccountingRepositoryGetter: Getter<MonthlyAccountingRepository>,
  ) {
    super(ClientInSociety, dataSource);
    this.monthlyAccounting = this.createBelongsToAccessorFor('monthlyAccounting', monthlyAccountingRepositoryGetter,);
    this.registerInclusionResolver('monthlyAccounting', this.monthlyAccounting.inclusionResolver);
    //this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    //this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
