import {injectable} from '@loopback/core';
import nodemailer from 'nodemailer';
import path from 'path';

@injectable()
export class EmailService {
  // Configuración optimizada para servidores en la nube (Railway)
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'robertoch2027@gmail.com',
      pass: 'iryw wcpo xpou yydt',
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    const logoPath = path.resolve(__dirname, '../../public/Logo2.png');

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #09356f; padding: 20px; text-align: center; color: white;">
            <h1>Recordatorio de vencimiento de FIEL</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <img src="cid:logoimage" alt="Logo" style="width: 150px; border-radius: 50%; margin-bottom: 20px;" />
            <p style="font-size: 16px; color: #333; line-height: 1.5;">
              ${message}
            </p>
            <p style="font-size: 14px; color: #777;">
              Favor de atender esta notificación a la brevedad posible.
            </p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © 2025 HR CONTADORES. Todos los derechos reservados.
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"HR Contadores" <robertoch2027@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      attachments: [
        {
          filename: 'Logo2.png',
          path: logoPath,
          cid: 'logoimage',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado exitosamente a:', to);
    } catch (error) {
      console.error('Error al enviar correo en el servidor:', error);
      if (error.code === 'ENOENT') {
        console.warn('El logo no se encontró, reintentando sin imagen...');
        const basicOptions = {
          ...mailOptions,
          attachments: [],
          html: html.replace('cid:logoimage', ''),
        };
        await this.transporter.sendMail(basicOptions);
      } else {
        throw error;
      }
    }
  }
}
