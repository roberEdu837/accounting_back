import {RequestBodyParserOptions} from '@loopback/rest';
import {Customer} from '../models';

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

export type PaymentsPdfBody = {
  id?: number | undefined;
  month: number;
  year: number;
  stateObligation: string;
  honorary: number;
  periodicity: string;
  rfcTaxPaymentDate: string;
  isInSociety: boolean;
  monthlyPaymentCompleted: boolean;
  customerId: number;
  customer?: Customer;
  paymets: {
    id?: number | undefined;
    amount: number;
    paymentDate: string;
    monthlyAccountingId?: number | undefined; // obligatorio
    paymentMethod: number;
    balance: number;
    honorary: number;
  }[];
};
