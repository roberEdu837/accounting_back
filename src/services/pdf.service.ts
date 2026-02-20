import {injectable} from '@loopback/core';
import fs from 'fs';
import path from 'path';
import pdfmake from 'pdfmake';
import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {monthsPdf} from '../conts';
import {PaymentsPdfBody} from '../specs/monthly-accounting.spec';

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
      pageMargins: [40, 40, 40, 140],
      content: [
        {
          columns: [
            {
              image: `data:image/png;base64,${logoBase64}`,
              width: 80,
            },
            {
              stack: [
                {
                  text: 'ESTADO DE CUENTA',
                  fontSize: 18,
                  color: '#09356f',
                  bold: true,
                },
                {
                  text: `Fecha: ${new Date().toLocaleDateString()}`,
                  fontSize: 9,
                  color: '#666',
                },
              ],
              alignment: 'right',
            },
          ],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 1,
              lineColor: '#09356f',
            },
          ],
        },
        {text: '', margin: [0, 10]},

        {
          columns: [
            {
              stack: [
                {text: 'CLIENTE', color: '#666', fontSize: 8},
                {text: data.customer?.socialReason, bold: true},
                {text: `RFC: ${data.customer?.rfc}`, fontSize: 9},
              ],
            },
            {
              stack: [
                {
                  text: 'HONORARIOS BASE',
                  color: '#666',
                  fontSize: 8,
                  alignment: 'right',
                },
                {
                  text: `$${data.customer?.honorary.toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
                  bold: true,
                  alignment: 'right',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {text: 'RESUMEN DE SALDOS PENDIENTES', style: 'subheader'},
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                {text: 'CONCEPTO', style: 'tableHeader'},
                {text: 'MES', style: 'tableHeader'},
                {text: 'IMPORTE', style: 'tableHeader', alignment: 'right'},
              ],
              ...data.accountingForMonth.map((d: any) => [
                {text: 'Honorarios Contables', style: 'tableCell'},
                {
                  text: `${monthsPdf.find(m => m.value === d.month)?.label}`,
                  style: 'tableCell',
                },
                {
                  text: `$${d.debt.toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
                  style: 'tableCell',
                  alignment: 'right',
                },
              ]),
              [
                {
                  text: 'TOTAL PENDIENTE',
                  colSpan: 2,
                  bold: true,
                  margin: [0, 10],
                  fontSize: 12,
                },
                {},
                {
                  text: `$${data.totalDebt.toLocaleString('es-MX', {minimumFractionDigits: 2})}`,
                  bold: true,
                  margin: [0, 10],
                  fontSize: 12,
                  alignment: 'right',
                  color: '#d32f2f',
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },

        {text: '', margin: [0, 20]},
        {
          stack: [
            {
              text: 'INFORMACIÓN DE PAGO',
              style: 'subheader',
              margin: [0, 0, 0, 5],
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#eee',
                },
              ],
            },
            {
              fillColor: '#f9f9f9',
              margin: [0, 10, 0, 0],
              stack: [
                {
                  text: 'Para regularizar su saldo, favor de realizar el depósito o transferencia a la siguiente cuenta:',
                  fontSize: 9,
                  margin: [0, 0, 0, 10],
                  style: 'subheader',
                },
                {
                  columns: [
                    {
                      stack: [
                        {text: 'BANCO', color: '#666', fontSize: 7},
                        {
                          text: 'BBVA',
                          bold: true,
                          color: '#09356f',
                          margin: [0, 0, 0, 5],
                        },
                        {text: 'TITULAR', color: '#666', fontSize: 7},
                        {text: 'Hans Allan Carlos Rodríguez Loza', bold: true},
                      ],
                    },
                    {
                      stack: [
                        {text: 'CUENTA', color: '#666', fontSize: 7},
                        {
                          text: '153 538 8791',
                          margin: [0, 0, 0, 5],
                        },
                        {text: 'CLABE', color: '#666', fontSize: 7},
                        {
                          text: '012 320 01535388791 8',
                          margin: [0, 0, 0, 5],
                        },
                        {text: 'TARJETA', color: '#666', fontSize: 7},
                        {text: '4152 3145 7488 0046'},
                      ],
                    },
                  ],
                },
                {
                  text: 'Quedo a la espera de su comprobante de pago. Si tiene alguna duda sobre los conceptos desglosados, hágamelo saber.',
                  fontSize: 8,
                  italics: true,
                  margin: [0, 15, 0, 0],
                  color: '#555',
                },
              ],
            },
          ],
        },
      ],
      styles: {
        subheader: {
          fontSize: 10,
          bold: true,
          color: '#09356f',
          margin: [0, 10, 0, 5],
        },
        tableHeader: {
          fillColor: '#f5f5f5',
          fontSize: 9,
          bold: true,
          margin: [5, 5],
        },
        tableCell: {
          fontSize: 9,
          margin: [5, 8],
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, _) => {
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    });
  }
}
