import {injectable} from '@loopback/core';
import fs from 'fs';
import path from 'path';
import {Resend} from 'resend';

@injectable()
export class EmailService {
  private resend = new Resend('re_f8h1LZA1_9DcS8gPM7ALReZRarwTg5k6d');

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    const logoPath = path.resolve(__dirname, '../../public/Logo2.png');

    let attachments: {
      filename: string;
      content: Buffer;
      cid: string;
      disposition: string;
    }[] = [];
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        attachments = [
          {
            filename: 'Logo2.png',
            content: logoBuffer,
            cid: 'logoimage',
            disposition: 'inline',
          },
        ];
      }
    } catch (err) {
      console.error('No se pudo cargar el logo para el adjunto:', err);
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #09356f; padding: 20px; text-align: center; color: white;">
            <h1>Recordatorio de vencimiento de FIEL</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
          <img src="cid:logoimage" alt="Logo" style="width: 150px; border-radius: 50%; margin-bottom: 20px;" />             <p style="font-size: 16px; color: #333; line-height: 1.5;">
              ${message}
            </p>
            <p style="font-size: 14px; color: #777;">
              Favor de atender esta notificación a la brevedad posible.
            </p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © 2026 HR CONTADORES. Todos los derechos reservados.
          </div>
        </div>
      </div>
    `;

    try {
      const {data, error} = await this.resend.emails.send({
        from: 'HR Contadores <onboarding@resend.dev>',
        to: 'robertoch2027@gmail.com',
        subject: subject,
        html: html,
        attachments: attachments,
      });

      if (error) {
        return console.error(' Error de Resend:', error);
      }

      console.log('Correo enviado exitosamente vía Resend. ID:', data?.id);
    } catch (err) {
      console.error('Error inesperado en EmailService:', err);
    }
  }
}
