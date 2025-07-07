import {injectable} from '@loopback/core';
import nodemailer from 'nodemailer';
import path from 'path';

@injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'robertoch2027@gmail.com',
      pass: 'iryw wcpo xpou yydt',
    },
  });

  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    const logoPath = path.resolve(__dirname, '../../public/Logo2.png');

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #09356f; padding: 20px; text-align: center; color: white;">
            <h1>¡Hola!</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <img src="cid:logoimage" alt="Imagen decorativa" style="width: 150px; border-radius: 50%; margin-bottom: 20px;" />
            <p style="font-size: 16px; color: #333;">
              Este es un correo de prueba
            </p>
            <p style="font-size: 14px; color: #777;">
              Gracias por utilizar nuestros servicios.
            </p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © 2025 HR CONTADORES. Todos los derechos reservados.
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: 'robertoch2027@gmail.com', // o process.env.EMAIL_USER
      to: to,
      subject: subject,
      html: html,
      attachments: [
        {
          filename: 'Logo2.png',
          path: logoPath,
          cid: 'logoimage', // el mismo id que usas en src="cid:logoimage"
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }
}
