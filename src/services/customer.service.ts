import {repository} from '@loopback/repository';
import {
  ClientInSocietyRepository,
  MonthlyAccountingRepository,
} from '../repositories';

export class CustomerService {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
    @repository(ClientInSocietyRepository)
    public clientInSocietyRepository: ClientInSocietyRepository,
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
}
