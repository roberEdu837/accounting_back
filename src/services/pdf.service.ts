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
}
