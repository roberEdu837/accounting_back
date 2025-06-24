import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {stateObligation} from '../models';
import {MonthlyAccountingRepository} from '../repositories';

@injectable()
export class AccountingService {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
  ) {}

  async generateMonthlyAccounting(
    customerId: number | undefined,
    periodicity: string | undefined,
    honorary: number,
    rfc: string,
  ): Promise<void> {
    const today = new Date();

    let currentMonth = today.getMonth() + 1;

    if (currentMonth % 2 === 0 && periodicity == 'BIMESTRAL') {
      currentMonth = currentMonth - 1;
    }

    const accounting: any = {
      customerId: customerId,
      month: currentMonth,
      year: new Date().getFullYear(),
      stateObligation: stateObligation.PENDIENTE,
      honorary,
      periodicity,
      rfcTaxPaymentDate: await this.getPaymentDate(rfc), // Fecha de pago del RFC
    };

    const existingAccounting = await this.monthlyAccountingRepository.findOne({
      where: {
        customerId: customerId,
        month: currentMonth,
        year: accounting.year,
      },
    });

    if (existingAccounting) {
      if (
        (existingAccounting?.periodicity === 'BIMESTRAL',
        currentMonth % 2 === 0)
      ) {
        console.log('Ya existe');
        return;
      }
    }

    if (!existingAccounting) {
      console.log('No existe');
      this.monthlyAccountingRepository.create(accounting);
    }
  }
  async getPaymentDate(rfc: string): Promise<Date> {
    const date = await this.getDate();
    let result = new Date(date);
    let daysAdded = 0;

    const sixthDigit = await this.getSixthDigit(rfc);
    const extraWorkingDays = await this.getExtraWorkingDays(sixthDigit);

    while (daysAdded < extraWorkingDays) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      // Verificar si es sábado (6) o domingo (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    return result;
  }

  async getSixthDigit(rfc: string): Promise<number> {
    const digits = rfc.match(/\d/g);
    const sixthDigit = digits ? parseInt(digits[5], 10) : 0;
    return sixthDigit;
  }

  async getExtraWorkingDays(digit: number): Promise<number> {
    switch (digit.toString()) {
      case '1':
      case '2':
        return 1;
      case '3':
      case '4':
        return 2;
      case '5':
      case '6':
        return 3;
      case '7':
      case '8':
        return 4;
      case '9':
      case '0':
        return 5;
      default:
        return 0; // por si no es un dígito válido
    }
  }

  async getDate(): Promise<Date> {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 17);
  }
}
