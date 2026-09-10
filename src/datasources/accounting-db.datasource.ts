
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'accountingDB',
  connector: 'mysql',
  host: 'ballast.proxy.rlwy.net',
  port: 20466,
  user: 'root',
  password: 'NCEiNZQYwIlJPXhxHHeHHSwYRNwyCFsw',
  database: 'accountingDB',
  dateStrings: true,
};

// Configuración local (Localhost)
// const config = {
//   name: 'accountingDB',
//   connector: 'mysql',
//   host: 'localhost',
//   port: 3306,
//   user: 'root',
//   password: 'root',
//   database: 'accountingDB',
//   dateStrings: true,
// };

@lifeCycleObserver('datasource')
export class AccountingDbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'accountingDB';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.accountingDB', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
