import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {TokenServiceBindings} from '../keys';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
    // @repository(InvalidtokensRepository)
    // public invalidtokensRepository: InvalidtokensRepository,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error: Sesión inválida.');
    }

    let userProfile: UserProfile;

    try {
      // decodificar perfil desde el token
      const decodedToken = await verifyAsync(token, this.jwtSecret);

      // no copiar campos como iat, exp, ni email directamente
      userProfile = Object.assign(
        {
          [securityId]: '',
          name: '',
        },
        {
          [securityId]: decodedToken.id,
          name: decodedToken.email,
          id: decodedToken.id,
          //roles: decodedToken.roles,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized('Sesión finalizada');
    }

    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized('Error al iniciar sesión');
    }

    const userInfoForToken = {
      id: userProfile[securityId],
      email: userProfile.email,
      //roles: userProfile.roles,
    };

    // Generar el JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret);
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error al iniciar sesión`);
    }

    return token;
  }
}
