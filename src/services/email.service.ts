import {injectable} from '@loopback/core';
import nodemailer from 'nodemailer';
import path from 'path';

@injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'robertoch2027@gmail.com',
      pass: 'awck fvlg udon dyyi',
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
  });

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    let logoPath = '';
    try {
      logoPath = path.resolve(__dirname, '../../public/Logo2.png');
    } catch (e) {
      console.error('Error al resolver la ruta del logo:', e);
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #09356f; padding: 20px; text-align: center; color: white;">
            <h1>Recordatorio de vencimiento de FIEL</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
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

    const mailOptions: any = {
      from: '"HR Contadores" <robertoch2027@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    };

    if (logoPath) {
      mailOptions.attachments = [
        {
          filename: 'Logo2.png',
          path: logoPath,
          cid: 'logoimage',
        },
      ];
    }

    try {
      console.log('Iniciando envío de correo...');
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Correo enviado con éxito a:', to);
    } catch (error) {
      console.error('❌ Error detallado de Nodemailer:', error);

      if (error.code === 'ETIMEDOUT') {
        console.error(
          'CONSEJO: Verifica si Gmail requiere activar "Acceso de apps menos seguras" o si tu App Password es correcto.',
        );
      }
    }
  }
}
