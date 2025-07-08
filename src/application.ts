import {
  AuthorizationBindings,
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationOptions,
  AuthorizationTags,
} from '@loopback/authorization';

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {CronComponent} from '@loopback/cron';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {AccountingDbDataSource} from './datasources';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  UserServiceBings,
} from './keys';
import {MyAuthorizationProvider} from './provider/MyAuthorizationProvider';
import {MySequence} from './sequence';
import {AccountingService} from './services/accounting.service';
import {EmailService} from './services/email.service';
import {BcryptHasher} from './services/hash.password.bcryptjs';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';
import {JWTAuthenticationStrategy} from './strategy/jwt-strategy';

export {ApplicationConfig};

export class AccountingApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    const authOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };
    this.configure(AuthorizationBindings.COMPONENT).to(authOptions);
    this.component(AuthorizationComponent);
    this.service(EmailService);
    this.setUpBindings();

    this.dataSource(AccountingDbDataSource);
    // Set up the custom sequence
    this.sequence(MySequence);
    this.service(AccountingService);
    registerAuthenticationStrategy(this as any, JWTAuthenticationStrategy);

    this.component(AuthenticationComponent);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers', 'cron-jobs'],
        extensions: ['.controller.js', '.cronjob.js'],
        nested: true,
      },
    };
    this.component(CronComponent);
  }
  setUpBindings() {
    this.bind('providers.MyAuthorizationProvider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(UserServiceBings.USER_SERVICE).toClass(MyUserService);
  }
}
