import {service} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {CustomerService} from '../services/customer.service';
import {EmailService} from '../services/email.service';

@cronJob()
export class MyCronJob extends CronJob {
  constructor(
    @service() private customerService: CustomerService,
    @service() private emailService: EmailService,
  ) {
    super({
      name: 'EmailJob',
      onTick: async () => {
        const users = await this.customerService.getCustomerExpereFIEL();
        users?.map(async customer => {
          await this.emailService.sendEmail(
            'ch190116079@chapala.tecmm.edu.mx',
            'Recordatorio de vencimiento de FIEL',
            `Estimado Hans, le recordamos que la FIEL del cliente "${customer.socialReason}" esta por vencer.`,
          );
          if (customer) {
            await this.customerService.updateNotificationStatus(
              customer.id,
              true,
            );
          }
        });
      },
      cronTime: '* * * * *',
      start: true,
    });
  }
}
