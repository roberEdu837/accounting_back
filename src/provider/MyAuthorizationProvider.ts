import {
  AuthorizationContext,
  AuthorizationDecision,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';

export class MyAuthorizationProvider implements Provider<Authorizer> {
  constructor() {}

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    //metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    // Verifica si hay un usuario autenticado
    if (!authorizationCtx.principals.length) {
      return AuthorizationDecision.DENY;
    }

    // Aquí podrías hacer más validaciones si quisieras, como verificar ID, email, etc.
    return AuthorizationDecision.ALLOW;
  }
}
