import {repository} from '@loopback/repository';
import {
  ClientInSocietyRepository,
  CustomerRepository,
  MonthlyAccountingRepository,
  PaymetRepository,
} from '../repositories';

export class CustomerService {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
    @repository(PaymetRepository)
    public paymetRepository: PaymetRepository,
  ) {}

  formatLocalDateForDB(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  async getCustomerExpereFIEL() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // inicio del día de hoy

    const threeMonthsFromToday = new Date(today);
    threeMonthsFromToday.setMonth(threeMonthsFromToday.getMonth() + 3);
    threeMonthsFromToday.setHours(0, 0, 0, 0); // fin del día exacto 3 meses después

    return this.customerRepository.find({
      where: {
        // renewalDate: {
        //   between: [today.toISOString(), threeMonthsFromToday.toISOString()],
        // },
        // renewalDate: threeMonthsFromToday.toISOString().replace('6', '0'),

        renewalDate: {
          //between: [
          //today.toISOString().replace('6', '0'),
          //threeMonthsFromToday.toISOString().replace('6', '0'),
          //],
        },
        notificationSent: false,
      },
    });
  }

  async updateNotificationStatus(
    customerId: number | undefined,
    status: boolean,
  ): Promise<void> {
    await this.customerRepository.updateById(customerId, {
      notificationSent: status,
    });
  }
}
