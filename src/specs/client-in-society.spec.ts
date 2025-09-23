import {RequestBodyParserOptions} from '@loopback/rest';

export const schemaFilterClientInSociety = {
  type: 'object',
  required: ['month', 'year'],
  properties: {
    month: {type: 'number'},
    year: {type: 'number'},
    search: {type: 'string'},
    monthlyPaymentCompleted: {type: 'boolean'},
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
  monthlyPaymentCompleted?: boolean;
};

// Schema para el body de update múltiple
export const schemaUpdateClientsInSociety = {
  type: 'object',
  required: ['ids', 'fecha'],
  properties: {
    ids: {
      type: 'array',
      items: {type: 'number'},
      description: 'Arreglo de IDs de ClientInSociety a actualizar',
    },
    fecha: {
      type: 'string',
      format: 'date', // o 'date-time' si es con hora
      description: 'Nueva fecha que se aplicará a los registros',
    },
  },
};

export const requestBodyUpdateClientsInSociety: Partial<RequestBodyParserOptions> =
  {
    content: {
      'application/json': {
        schema: schemaUpdateClientsInSociety,
      },
    },
  };

// Tipado en TypeScript para el body
export type UpdateManyClientsInSociety = {
  ids: number[];
  fecha: string;
};
