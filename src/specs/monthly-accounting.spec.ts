import {RequestBodyParserOptions} from '@loopback/rest';

export const schemaFilterMonthlyAccounting = {
  type: 'object',
  required: ['month', 'year'],
  properties: {
    month: {type: 'number'},
    search: {type: 'string'},
    year: {type: 'number'},
    monthlyPaymentCompleted: {type: 'boolean'},
  },
};

export const requestBodyFilterMonthlyAccounting: Partial<RequestBodyParserOptions> =
  {
    content: {
      'application/json': {
        schema: schemaFilterMonthlyAccounting,
      },
    },
  };

export type FilterDataMonthlyAccounting = {
  month: number;
  search?: string;
  year: number;
  monthlyPaymentCompleted?: boolean;
};

export const schemaDebtsPdf = {
  type: 'object',
  required: ['name', 'rfc', 'debts'],
  properties: {
    name: {type: 'string'},
    rfc: {type: 'string'},
    debts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'total', 'month', 'year', 'honorary', 'debts'],
        properties: {
          id: {type: 'number'},
          total: {type: 'number'},
          month: {type: 'number'},
          year: {type: 'number'},
          honorary: {type: 'number'},
          debts: {type: 'number'},
        },
      },
    },
  },
};

export const requestBodyDebtsPdf: Partial<RequestBodyParserOptions> = {
  content: {
    'application/json': {
      schema: schemaDebtsPdf,
    },
  },
};

export type DebtsPdfBody = {
  name: string;
  rfc: string;
  debts: {
    id: number;
    total: number;
    month: number;
    year: number;
    honorary: number;
    debts: number;
  }[];
};
