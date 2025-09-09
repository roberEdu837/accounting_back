import {injectable} from '@loopback/core';
import fs from 'fs';
import path from 'path';
import pdfmake from 'pdfmake';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {PaymentsPdfBody} from '../specs/monthly-accounting.spec';
import {formatDatePretty, getPeriodText} from '../utils/formatDate';

@injectable()
export class PdfGeneratorService {
  async generatePaymentsStatement(data: PaymentsPdfBody): Promise<Buffer> {
    const fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const logoPath = path.resolve(__dirname, '../../public/Logo2.png');
    const logoBase64 = fs.readFileSync(logoPath, {encoding: 'base64'});
    const printer = new pdfmake(fonts);

    const docDefinition: TDocumentDefinitions = {
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      content: [
        {
          stack: [
            {
              columns: [
                {
                  text: 'HR CONTADORES',
                  alignment: 'left',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: 'ESTADO DE CUENTA',
                  alignment: 'right',
                  color: '#09356f',
                  margin: [0, 0, 0, 0] as [number, number, number, number],
                },
              ],
            },
            {
              table: {
                widths: ['auto', '*'], // izquierda: logo, derecha: datos cliente
                body: [
                  [
                    {
                      image: `data:image/png;base64,${logoBase64}`,
                      width: 100,
                      alignment: 'left',
                      margin: [0, 0, 10, 0],
                    },
                    {
                      stack: [
                        {
                          text: `CLIENTE: ${data.customer?.socialReason}`,
                          margin: [200, 5, 0, 2],
                          alignment: 'left',
                        },
                        {
                          text: `RFC: ${data.customer?.rfc}`,
                          margin: [200, 5, 0, 2],
                          alignment: 'left',
                        },
                        {
                          text: getPeriodText(
                            data.month,
                            data.year,
                            data.periodicity,
                          ),
                          margin: [200, 5, 0, 2],
                          alignment: 'left',
                        },
                        {
                          text: `HONORARIOS: ${data.honorary.toFixed(2)}`,
                          margin: [200, 5, 0, 2],
                          alignment: 'left',
                        },
                      ],
                      alignment: 'right',
                    },
                  ],
                ],
              },
              layout: 'noBorders', // sin bordes visibles
              margin: [0, 10, 0, 20], // espacio alrededor
            },
          ],
        },

        {
          text: 'DETALLE DE PAGOS',
        },
        ...(data.paymets.length > 0
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: ['15%', '25%', '20%', '20%', '20%'],
                  body: [
                    [
                      {
                        text: '# Pago',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Fecha de pago',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Metodo de pago',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Monto',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Saldo después del pago',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                    ],
                    ...data.paymets.map((d: any, i: any) => {
                      const shades = ['#dce3f1', '#b3c4e3'];
                      return [
                        {
                          text: d.id?.toString() || '',
                          fillColor: shades[i % 2],
                        },
                        {
                          text: formatDatePretty(d.paymentDate),
                          fillColor: shades[i % 2],
                        },
                        {
                          text: `${d.paymentMethod == 0 ? 'Efectivo' : d.paymentMethod == 1 ? 'Transferencia' : 'Retiro sin tarjeta'}`,
                          fillColor: shades[i % 2],
                        },
                        {
                          text: `$${d.amount.toFixed(2)}`,
                          fillColor: shades[i % 2],
                        },
                        {
                          text: `$${d.balance.toFixed(2)}`,
                          fillColor: shades[i % 2],
                        },
                      ];
                    }),
                  ],
                },
                layout: {
                  hLineWidth: () => 0.5,
                  vLineWidth: () => 0.5,
                  hLineColor: () => '#ccc',
                  vLineColor: () => '#ccc',
                  paddingTop: () => 4,
                  paddingBottom: () => 4,
                },
                margin: [0, 10, 0, 10] as [number, number, number, number],
              },
            ]
          : [
              {
                text: 'Sin pagos registrados.',
                italics: true,
                margin: [0, 10, 0, 10] as [number, number, number, number],
              },
            ]),
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 10] as [number, number, number, number],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number],
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    });
  }
}
