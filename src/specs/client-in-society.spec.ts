import {RequestBodyParserOptions} from '@loopback/rest';

export const schemaFilterClientInSociety = {
  type: 'object',
  required: ['month', 'year'],
  properties: {
    month: {type: 'number'},
    year: {type: 'number'},
    search: {type: 'string'},
    status: {type: 'boolean'},
  },
};

export const requestBodyFilterClientInSociety: Partial<RequestBodyParserOptions> =
  {
    content: {
      'application/json': {
        schema: schemaFilterClientInSociety,
      },
    },
  };

export type FilterDataClientInSociety = {
  month: number;
  year: number;
  search?: string;
  status?: boolean;
};
