import {repository} from '@loopback/repository';
import {
  ClientInSocietyRepository,
  CustomerRepository,
  MonthlyAccountingRepository,
} from '../repositories';

export class CustomerService {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
    @repository(CustomerRepository)
    public customerRepository: CustomerRepository,
  ) {}

  async editIfHonorarioGreaterThan(
    customerId: number,
    month: number,
    honorary: number,
    periodicity: string,
  ) {
    const year = new Date().getFullYear(); //año actual
    if (periodicity === 'BIMESTRAL' && month % 2 === 0) {
      // Si es bimestral y el mes es par
      month = month - 1;
    }

    // Buscar la contabilidad mensual del cliente
    const accounting = await this.monthlyAccountingRepository.findOne({
      where: {customerId, month, year},
    });
    // Si no hay contabilidad mensual, no hace nada
    if (!accounting) {
      return;
    }
    // editar la contabilidad mensual con el nuevo honorario
    await this.monthlyAccountingRepository.updateById(accounting?.id, {
      honorary,
    });

    // Eliminar todos los registros de clientes en sociedad asociados a esta contabilidad mensual
    await this.clientInSocietyRepository.deleteAll({
      monthlyAccountingId: accounting?.id,
    });
  }

  async getCustomerExpereFIEL() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día actual
    console.log(today.toString(), 'today');

    const threeMonthsFromToday = new Date();
    threeMonthsFromToday.setMonth(threeMonthsFromToday.getMonth() + 3);
    threeMonthsFromToday.setHours(23, 59, 59, 999); // Fin del día 3 meses después

    // Buscar todos los que vencen entre hoy y dentro de 3 meses
    return this.customerRepository.find({
      where: {
        renewalDate: {
          between: [today.toString(), threeMonthsFromToday.toString()],
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
