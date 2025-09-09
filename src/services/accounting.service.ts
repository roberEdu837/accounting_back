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

    let currentMonth = month ? month : today.getMonth() + 1;
    let year = 2026;
    let currentYear = year;

    if (periodicity === 'BIMESTRAL') {
      const Bimonthly = this.getBimonthlyMonth(currentMonth, periodicity, year);
      currentMonth = Bimonthly?.month ? Bimonthly.month : currentMonth;
      year = Bimonthly?.year ? Bimonthly.year : year;
    }

    if (periodicity === 'MENSUAL') {
      const Monthly = this.getMonthlyMonth(currentMonth, periodicity, year);
      currentMonth = Monthly?.prevMonth ? Monthly.prevMonth : currentMonth;
      year = Monthly?.year ? Monthly.year : year;
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
        month ? month : 0,
        year,
      ),
      monthlyPaymentCompleted: false,
    };

    const existingAccounting = await this.monthlyAccountingRepository.findOne({
      where: {
        customerId: customerId,
        month: currentMonth,
        year: month === 1 ? currentYear - 1 : currentYear,
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
  getMonthlyMonth(currentMonth: number, periodicity: string, year: number) {
    if (!currentMonth || periodicity != 'MENSUAL') return;
    switch (currentMonth) {
      case 1: // Enero
        return {prevMonth: 12, currMonth: 1, year: year - 1};
      case 2: // Febrero
        return {prevMonth: 1, currMonth: 2, year};
      case 3: // Marzo
        return {prevMonth: 2, currMonth: 3, year};
      case 4: // Abril
        return {prevMonth: 3, currMonth: 4, year};
      case 5: // Mayo
        return {prevMonth: 4, currMonth: 5, year};
      case 6: // Junio
        return {prevMonth: 5, currMonth: 6, year};
      case 7: // Julio
        return {prevMonth: 6, currMonth: 7, year};
      case 8: // Agosto
        return {prevMonth: 7, currMonth: 8, year};
      case 9: // Septiembre
        return {prevMonth: 8, currMonth: 9, year};
      case 10: // Octubre
        return {prevMonth: 9, currMonth: 10, year};
      case 11: // Noviembre
        return {prevMonth: 10, currMonth: 11, year};
      case 12: // Diciembre
        return {prevMonth: 11, currMonth: 12, year};
      default:
        throw new Error('Mes inválido');
    }
  }

  getBimonthlyMonth(month: number, periodicity: string, year: number) {
    if (!month || periodicity !== 'BIMESTRAL') return;

    switch (month) {
      case 12: // Diciembre
      case 1: // Enero
        return {month: 11, year: month === 12 ? year : year - 1}; // Noviembre

      case 2: // Febrero
      case 3: // Marzo
        return {month: 1, year}; // Enero

      case 4: // Abril
      case 5: // Mayo
        return {month: 3, year}; // Marzo

      case 6: // Junio
      case 7: // Julio
        return {month: 5, year}; // Mayo

      case 8: // Agosto
      case 9: // Septiembre
        return {month: 7, year}; // Julio

      case 10: // Octubre
      case 11: // Noviembre
        return {month: 9, year}; // Septiembre

      default:
        throw new Error('Mes inválido');
    }
  }
}
