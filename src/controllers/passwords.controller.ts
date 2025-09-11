import {repository} from '@loopback/repository';
import {
  getModelSchemaRef,
  param,
  patch,
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

  @patch('/passwords/{id}')
  @response(204, {
    description: 'Passwords PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Passwords, {partial: true}), // permite solo campos que quieras actualizar
        },
      },
    })
    passwords: Partial<Passwords>,
  ): Promise<void> {
    await this.passwordsRepository.updateById(id, passwords);
  }
}
