import {injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {stateObligation} from '../models';
import {MonthlyAccountingRepository} from '../repositories';
import {paymentDateToString} from '../utils/formatDate';

@injectable()
export class AccountingService {
  constructor(
    @repository(MonthlyAccountingRepository)
    public monthlyAccountingRepository: MonthlyAccountingRepository,
  ) {}

  async generateMonthlyAccounting(
    customerId: number | undefined,
    periodicity: string,
    honorary: number,
    rfc: string,
    isInSociety: boolean,
    month?: number,
  ): Promise<void> {
    const today = new Date();

    //let currentMonth = today.getMonth() + 1;
    let currentMonth = month ? month : today.getMonth() + 1;
    let year = today.getFullYear();
    let nextMonth = 0;
    let currentYear = year;
    const originalMonth = currentMonth;

    if (periodicity === 'BIMESTRAL') {
      switch (currentMonth) {
        case 12: // Diciembre
        case 1: // Enero
          //case 2: // Febrero

          currentMonth = 11;
          // year = year - 1;
          break;
        case 2: // Febrero
        case 3: // Marzo
          //case 4: // Abril
          currentMonth = 1;
          break;
        case 4: // Abril
        case 5: // Mayo
          //case 6: // Junio
          currentMonth = 3;
          break;
        case 6: // Junio
        case 7: // Julio
          //case 8: // Agosto
          currentMonth = 5;
          break;
        case 8: // Agosto
        case 9: // Septiembre
          ///case 10: // Octubre
          currentMonth = 7;
          break;
        case 10: // Octubre
        case 11: // Noviembre
          currentMonth = 9;
          break;

        default:
          throw new Error('Mes inválido');
      }
    }

    if (periodicity === 'MENSUAL') {
      switch (currentMonth) {
        case 1: // Enero
          currentMonth = 12;
          nextMonth = 1;
          year = year - 1;
          break;
        case 2: // Febrero
          currentMonth = 1;
          nextMonth = 2;
          break;
        case 3: // Marzo
          currentMonth = 2;
          nextMonth = 3;
          break;
        case 4: // Abril
          currentMonth = 3;
          nextMonth = 4;
          break;
        case 5: // Mayo
          currentMonth = 4;
          nextMonth = 5;
          break;
        case 6: // Junio
          currentMonth = 5;
          nextMonth = 6;
          break;
        case 7: // Julio
          currentMonth = 6;
          nextMonth = 7;
          break;
        case 8: // Agosto
          currentMonth = 7;
          nextMonth = 8;
          break;
        case 9: // Septiembre
          currentMonth = 8;
          nextMonth = 9;
          break;
        case 10: // Octubre
          currentMonth = 9;
          nextMonth = 10;
          break;
        case 11: // Noviembre
          currentMonth = 10;
          nextMonth = 11;
          break;
        case 12: // Diciembre
          currentMonth = 11;
          nextMonth = 12;
          break;
        default:
          throw new Error('Mes inválido');
      }
    }

    const accounting: any = {
      customerId: customerId,
      month: currentMonth,
      year: year,
      stateObligation: stateObligation.PENDIENTE,
      honorary,
      periodicity,
      isInSociety,
      rfcTaxPaymentDate: await this.getPaymentDate(
        rfc,
        periodicity,
        month ? month : originalMonth,
        year,
      ),
      monthlyPaymentCompleted: false,
    };
    console.log(accounting, 'accounting por crear');
    console.log(year, 'año');
    console.log(currentMonth, 'mes2');

    const existingAccounting = await this.monthlyAccountingRepository.findOne({
      where: {
        customerId: customerId,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (currentMonth % 2 === 0 && periodicity === 'BIMESTRAL') {
      return;
    }

    //No existe
    if (!existingAccounting) {
      this.monthlyAccountingRepository.create(accounting);
    }
  }

  async getPaymentDate(
    rfc: string,
    periodicity: string,
    month: number,
    year: number,
  ): Promise<string> {
    const date = await this.getDate(year, month);
    let result = new Date(date);

    if (periodicity === 'BIMESTRAL') {
      const date = paymentDateToString(new Date(year, month + 1, 0));
      return date;
    }

    let daysAdded = 0;

    const sixthDigit = await this.getSixthDigit(rfc);
    const extraWorkingDays = await this.getExtraWorkingDays(sixthDigit);

    while (daysAdded < extraWorkingDays) {
      result.setDate(result.getDate() + 1);

      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    return paymentDateToString(result);
  }

  async getSixthDigit(rfc: string): Promise<number> {
    const digits = rfc.match(/\d/g);
    const sixthDigit = digits ? parseInt(digits[5], 10) : 0;
    return sixthDigit;
  }

  async getDate(year: number, month: number): Promise<Date> {
    const today = new Date(year, month - 1);
    return new Date(today.getFullYear(), today.getMonth(), 17);
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
}
