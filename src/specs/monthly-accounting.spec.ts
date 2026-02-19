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

export const schemaPaymentsPdf = {
  type: 'array',
  items: {
    type: 'object',
    required: [
      'id',
      'month',
      'year',
      'stateObligation',
      'honorary',
      'periodicity',
      'rfcTaxPaymentDate',
      'isInSociety',
      'monthlyPaymentCompleted',
      'customerId',
      'payments',
    ],
    properties: {
      id: {type: 'number'},
      month: {type: 'number'},
      year: {type: 'number'},
      stateObligation: {type: 'string'},
      honorary: {type: 'number'},
      periodicity: {type: 'string'},
      rfcTaxPaymentDate: {type: 'string', format: 'date-time'},
      isInSociety: {type: 'boolean'},
      monthlyPaymentCompleted: {type: 'boolean'},
      customerId: {type: 'number'},
      payments: {
        type: 'array',
        items: {
          type: 'object',
          required: [
            'id',
            'amount',
            'paymentDate',
            'monthlyAccountingId',
            'paymentMethod',
            'balance',
            'honorary',
          ],
          properties: {
            id: {type: 'number'},
            amount: {type: 'number'},
            paymentDate: {type: 'string', format: 'date-time'},
            monthlyAccountingId: {type: 'number'},
            paymentMethod: {type: 'number'},
            balance: {type: 'number'},
            honorary: {type: 'number'},
          },
        },
      },
    },
  },
};

export const requestBodyPaymentsPdf: Partial<RequestBodyParserOptions> = {
  content: {
    'application/json': {
      schema: schemaPaymentsPdf,
    },
  },
};

type Customer = {
  socialReason: string;
  rfc: string;
  honorary: number;
};

type MonthlyAccounting = {
  month: number;
  debt: number;
  year: number;
  periodicity: string;
  honorary: number;
};

export type PaymentsPdfBody = {
  customer: Customer;
  totalDebt: number;
  accountingForMonth: MonthlyAccounting[];
};
