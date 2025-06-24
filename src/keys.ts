import {TokenService, UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {User} from './models';
import {Credentials} from './repositories';
import {PasswordHasher} from './services/hash.password.bcryptjs';
export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'hansolo';
  export const TOKEN_EXPIRES_IN_VALUE = '6000';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );

  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );

  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenService',
  );
}
export namespace UserServiceBings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'service.user.service',
  );
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
    'services.bcryptjs.HashPassword',
  );
  export const ROUNDS = BindingKey.create<number>('services.bcryptjs.rounds');
}
