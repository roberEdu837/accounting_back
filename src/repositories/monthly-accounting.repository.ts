import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {AccountingDbDataSource} from '../datasources';
import {
  Customer,
  MonthlyAccounting,
  MonthlyAccountingRelations,
} from '../models';
import {Paymet} from '../models/paymet.model';
import {CustomerRepository} from './customer.repository';
import {PaymetRepository} from './paymet.repository';

export class MonthlyAccountingRepository extends DefaultCrudRepository<
  MonthlyAccounting,
  typeof MonthlyAccounting.prototype.id,
  MonthlyAccountingRelations
> {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof MonthlyAccounting.prototype.id
  >;

  public readonly paymets: HasManyRepositoryFactory<
    Paymet,
    typeof MonthlyAccounting.prototype.id
  >;

  constructor(
    @inject('datasources.accountingDB') dataSource: AccountingDbDataSource,
    @repository.getter('CustomerRepository')
    protected customerRepositoryGetter: Getter<CustomerRepository>,
    @repository.getter('PaymetRepository')
    protected paymetRepositoryGetter: Getter<PaymetRepository>,
  ) {
    super(MonthlyAccounting, dataSource);
    this.paymets = this.createHasManyRepositoryFactoryFor(
      'paymets',
      paymetRepositoryGetter,
    );
    this.registerInclusionResolver('paymets', this.paymets.inclusionResolver);
    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
