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

  // async editIfHonorarioGreaterThan(
  //   customerId: number,
  //   month: number,
  //   honorary: number,
  //   periodicity: string,
  // ) {
  //   //Año actual
  //   const year = new Date().getFullYear();

  //   const isBimestral = periodicity === 'BIMESTRAL';
  //   const isEvenMonth = month % 2 === 0;

  //   // Ajustar al primer mes del bimestre
  //   if (isBimestral && isEvenMonth) month -= 1;

  //   // Buscar la contabilidad mensual del cliente
  //   const accounting = await this.monthlyAccountingRepository.findOne({
  //     where: {customerId, month, year},
  //   });
  //   // Si no hay contabilidad mensual, no hace nada
  //   if (!accounting) {
  //     return;
  //   }

  //   const payments = await this.paymetRepository.find({
  //     where: {
  //       monthlyAccountingId: accounting.id,
  //     },
  //   });

  //   const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  //   if (total > honorary) {
  //     console.log('No edita');
  //     return;
  //   }

  //   // editar la contabilidad mensual con el nuevo honorario
  //   await this.monthlyAccountingRepository.updateById(accounting?.id, {
  //     honorary,
  //   });

  //   // Eliminar todos los registros de clientes en sociedad asociados a esta contabilidad mensual
  //   await this.clientInSocietyRepository.deleteAll({
  //     monthlyAccountingId: accounting?.id,
  //   });
  // }

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
    console.log(today.toISOString(), 'hoy');
    console.log(
      threeMonthsFromToday.toISOString().replace('6', '0'),
      'otro dia',
    );

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
