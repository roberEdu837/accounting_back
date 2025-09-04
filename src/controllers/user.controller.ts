import {TokenService, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBings,
} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {userRegisterData} from '../specs/user.specs';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(UserServiceBings.USER_SERVICE)
    public userService: UserService<User, Credentials>,

    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
  ) {}

  @post('/users/register')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async register(
    @requestBody({
      description: 'User registration request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password', 'email', 'name'],
            properties: {
              username: {
                type: 'string',
                minLength: 3,
                maxLength: 20,
              },
              password: {
                type: 'string',
                minLength: 6,
                maxLength: 100,
              },
              email: {
                type: 'string',
              },
              name: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
              },
            },
          },
        },
      },
    })
    userData: userRegisterData,
  ): Promise<User> {
    // Create a new user instance using the provided data
    //const user = _.pick(userData, ['username', 'password', 'email', 'name']);
    //validateCredentials(user);
    const newUser = {
      username: userData.username,
      email: userData.email,
      name: userData.name,
    };
    const password = await this.passwordHasher.hashPassword(userData.password);

    const foundUser = await this.userRepository.findOne({
      where: {
        or: [
          {email: userData.email},
          {username: userData.username}, // aquí corregí: userData.username
        ],
      },
    });

    if (foundUser) {
      if (foundUser.email === userData.email) {
        throw new HttpErrors.UnprocessableEntity(
          'Usuario ya registrado con este email',
        );
      }
      if (foundUser.username === userData.username) {
        throw new HttpErrors.UnprocessableEntity(
          'Usuario ya registrado con este nombre de usuario',
        );
      }
    }

    const saveUser = await this.userRepository.create(newUser);

    await this.userRepository.userCredentials(saveUser.id).create({
      password,
    });
    return saveUser;
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @post('users/login')
  @response(200, {
    description: 'jwt user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
            },
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    credentials: Credentials,
  ): Promise<{user: User; token: string}> {
    // lógica del login iría aquí
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);

    const token = await this.jwtService.generateToken(userProfile);
    return {user, token};
  }
}
