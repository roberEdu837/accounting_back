import {RequestBodyParserOptions} from '@loopback/rest';

export const schemaFilterCustomer = {
  type: 'object',
  required: ['month', 'year'],
  properties: {
    search: {type: 'string'},
    isInSociety: {type: 'boolean'},
    status: {type: 'boolean'},
  },
};

export const requestBodyFilterCustomer: Partial<RequestBodyParserOptions> = {
  content: {
    'application/json': {
      schema: schemaFilterCustomer,
    },
  },
};

export type FilterDataCustomer = {
  search?: string;
  isInSociety?: boolean;
  status?: boolean;
};
