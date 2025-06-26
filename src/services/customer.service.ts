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
    const year = new Date().getFullYear();
    if (periodicity === 'BIMESTRAL') month = month - 1;

    const accounting = await this.monthlyAccountingRepository.findOne({
      where: {customerId, month, year},
    });

    await this.monthlyAccountingRepository.updateById(accounting?.id, {
      honorary,
    });

    await this.clientInSocietyRepository.deleteAll({
      monthlyAccountingId: accounting?.id,
    });
  }
}
