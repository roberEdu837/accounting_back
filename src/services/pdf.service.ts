import {injectable} from '@loopback/core';
import fs from 'fs';
import path from 'path';
import pdfmake from 'pdfmake';
import {TDocumentDefinitions} from 'pdfmake/interfaces';

@injectable()
export class PdfGeneratorService {
  async generateAccountStatement(data: {
    customerName: string;
    rfc: string;
    period: string;
    payments: {paymentDate: string; amount: number}[];
  }): Promise<Buffer> {
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
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          columns: [
            {
              image: `data:image/png;base64,${logoBase64}`,
              width: 100,
            },
            {
              text: 'HR Contadores',
              alignment: 'right',
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 0],
            },
          ],
        },
        {
          text: 'Estado de Cuenta',
          style: 'title',
        },
        {
          columns: [
            {
              width: '60%',
              stack: [
                {text: `Cliente: ${data.customerName}`},
                {text: `RFC: ${data.rfc}`},
              ],
            },
            {
              width: '40%',
              stack: [
                {
                  text: `Periodo del: ${data.period}`,
                  alignment: 'right',
                },
              ],
            },
          ],
          margin: [0, 10, 0, 10],
        },
        {
          text: '\nDetalle de Pagos',
          style: 'subheader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['50%', '50%'],
            body: [
              [
                {
                  text: 'Fecha',
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
              ],
              ...data.payments.map((p, i) => {
                const shades = ['#dce3f1', '#b3c4e3'];
                return [
                  {text: p.paymentDate, fillColor: shades[i % 2]},
                  {text: `$${p.amount.toFixed(2)}`, fillColor: shades[i % 2]},
                  // {text: p.status, fillColor: shades[i % 2]},
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
        },

        {
          text: '\nResumen de Cuenta',
          style: 'subheader',
        },
        {
          ul: [
            'Saldo anterior: $10,000.00',
            'Pagos realizados: $2,345.67',
            'Nuevo saldo: $12,345.67',
          ],
        },
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
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

  async generateAccountStatement2(data: {
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
  }): Promise<Buffer> {
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

    const totalHonorarios = data.debts.reduce((sum, d) => sum + d.honorary, 0);
    const totalPagado = data.debts.reduce((sum, d) => sum + d.total, 0);
    const totalDeuda = data.debts.reduce((sum, d) => sum + d.debts, 0);
    const docDefinition: TDocumentDefinitions = {
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      content: [
        {
          columns: [
            {
              image: `data:image/png;base64,${logoBase64}`,
              width: 100,
            },
            {
              text: 'HR Contadores',
              alignment: 'right',
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 0] as [number, number, number, number],
            },
          ],
        },
        {
          text: 'Estado de Deudas',
          style: 'title',
        },
        {
          columns: [
            {
              width: '60%',
              stack: [
                {text: `Cliente: ${data.name}`},
                {text: `RFC: ${data.rfc}`},
              ],
            },
          ],
          margin: [0, 10, 0, 10] as [number, number, number, number],
        },
        {
          text: 'Detalle de Deudas',
          style: 'subheader',
        },
        ...(data.debts.length > 0
          ? [
              {
                table: {
                  headerRows: 1,
                  widths: ['15%', '25%', '20%', '20%', '20%'],
                  body: [
                    [
                      {
                        text: 'Mes',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Año',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Honorarios',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Pagado',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                      {
                        text: 'Deuda',
                        fillColor: '#09356f',
                        color: 'white',
                        bold: true,
                      },
                    ],
                    ...data.debts.map((d, i) => {
                      const shades = ['#dce3f1', '#b3c4e3'];
                      return [
                        {
                          text: d.month.toString().padStart(2, '0'),
                          fillColor: shades[i % 2],
                        },
                        {text: d.year.toString(), fillColor: shades[i % 2]},
                        {
                          text: `$${d.honorary.toFixed(2)}`,
                          fillColor: shades[i % 2],
                        },
                        {
                          text: `$${d.total.toFixed(2)}`,
                          fillColor: shades[i % 2],
                        },
                        {
                          text: `$${d.debts.toFixed(2)}`,
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
              {
                text: 'Resumen',
                style: 'subheader',
                margin: [0, 10, 0, 5] as [number, number, number, number],
              },
              {
                ul: [
                  `Total honorarios: $${totalHonorarios.toFixed(2)}`,
                  `Total pagado: $${totalPagado.toFixed(2)}`,
                  `Total deuda: $${totalDeuda.toFixed(2)}`,
                ],
                margin: [0, 0, 0, 10] as [number, number, number, number],
              },
            ]
          : [
              {
                text: 'Felicidades, estás al corriente.',
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
