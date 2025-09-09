import {Filter, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Passwords} from '../models';
import {PasswordsRepository} from '../repositories';

export class PasswordsController {
  constructor(
    @repository(PasswordsRepository)
    public passwordsRepository: PasswordsRepository,
  ) {}

  @post('/passwords')
  @response(200, {
    description: 'Passwords model instance',
    content: {'application/json': {schema: getModelSchemaRef(Passwords)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Passwords, {
            title: 'NewPasswords',
            exclude: ['id'],
          }),
        },
      },
    })
    passwords: Omit<Passwords, 'id'>,
  ): Promise<Passwords> {
    return this.passwordsRepository.create(passwords);
  }

  @get('/passwords/{customerId}')
  @response(200, {
    description: 'Array of Passwords model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Passwords, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.number('customerId') customerId: number,
    @param.filter(Passwords) filter?: Filter<Passwords>,
  ): Promise<Passwords[]> {
    return this.passwordsRepository.find({
      ...filter,
      where: {customerId},
      include: [{relation: 'customer'}],
    });
  }
}
