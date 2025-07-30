import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
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

  @get('/passwords/count')
  @response(200, {
    description: 'Passwords model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Passwords) where?: Where<Passwords>,
  ): Promise<Count> {
    return this.passwordsRepository.count(where);
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

  @patch('/passwords')
  @response(200, {
    description: 'Passwords PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Passwords, {partial: true}),
        },
      },
    })
    passwords: Passwords,
    @param.where(Passwords) where?: Where<Passwords>,
  ): Promise<Count> {
    return this.passwordsRepository.updateAll(passwords, where);
  }

  @get('/passwords/{id}')
  @response(200, {
    description: 'Passwords model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Passwords, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Passwords, {exclude: 'where'})
    filter?: FilterExcludingWhere<Passwords>,
  ): Promise<Passwords> {
    return this.passwordsRepository.findById(id, filter);
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
          schema: getModelSchemaRef(Passwords, {partial: true}),
        },
      },
    })
    passwords: Passwords,
  ): Promise<void> {
    await this.passwordsRepository.updateById(id, passwords);
  }

  @put('/passwords/{id}')
  @response(204, {
    description: 'Passwords PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() passwords: Passwords,
  ): Promise<void> {
    await this.passwordsRepository.replaceById(id, passwords);
  }

  @del('/passwords/{id}')
  @response(204, {
    description: 'Passwords DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.passwordsRepository.deleteById(id);
  }
}
