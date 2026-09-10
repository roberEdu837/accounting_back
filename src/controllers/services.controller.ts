import {
  Filter,
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {Services} from '../models';
import {ServicesRepository} from '../repositories';

export class ServicesController {
  constructor(
    @repository(ServicesRepository)
    public servicesRepository: ServicesRepository,
  ) { }

  @post('/services')
  @response(200, {
    description: 'Services model instance',
    content: {'application/json': {schema: getModelSchemaRef(Services)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Services, {
            title: 'NewServices',
            exclude: ['id'],
          }),
        },
      },
    })
    services: Omit<Services, 'id'>,
  ): Promise<Services> {
    return this.servicesRepository.create(services);
  }


  @get('/services')
  @response(200, {
    description: 'Array of Services model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Services, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Services) filter?: Filter<Services>,
  ): Promise<Services[]> {
    return this.servicesRepository.find(filter);
  }

  @patch('/services/{id}')
  @response(204, {
    description: 'Services PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Services, {partial: true}),
        },
      },
    })
    services: Services,
  ): Promise<void> {
    await this.servicesRepository.updateById(id, services);
  }



  // @del('/services/{id}')
  // @response(204, {
  //   description: 'Services DELETE success',
  // })
  // async deleteById(@param.path.number('id') id: number): Promise<void> {
  //   await this.servicesRepository.deleteById(id);
  // }
}
