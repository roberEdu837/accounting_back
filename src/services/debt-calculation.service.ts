import {BindingScope, injectable} from '@loopback/core';
import {AccountingService, MonthlyAccounting} from '../models';

export interface ServiceDebtInfo {
  id: number;
  description: string;
  name: string;
  amount: number;
  status: string;
  monthlyAccountingId: number;
  servicesId: number;
  paid: number;
  debt: number;
}

export interface MonthlyDebtInfo {
  month: number;
  debt: number;
  year: number;
  periodicity: string;
  honorary: number;
  totalPaid: number;
}

@injectable({scope: BindingScope.TRANSIENT})
export class DebtCalculationService {
  constructor() { }


  calculateMonthlyDebts(accountings: MonthlyAccounting[]): MonthlyDebtInfo[] {
    return accountings
      .map((acc: any) => {
        console.log(acc)

        console.log(acc.paymets)
        const totalPaid = (acc.paymets ?? []).reduce(
          (sum: number, p: any) => sum + (p.amount ?? 0),
          0,
        );

        console.log(totalPaid)

        const honorary = acc.honorary ?? 0;

        return {
          month: acc.month,
          debt: honorary - totalPaid,
          year: acc.year,
          periodicity: acc.periodicity,
          honorary,
          totalPaid: totalPaid
        };
      })
      .filter(acc => acc.debt > 0);
  }


  calculateServicesDebts(accountingServices: AccountingService[]): ServiceDebtInfo[] {
    return accountingServices.map((service: any) => {
      const serviceObj = service.toJSON ? service.toJSON() : service;
      const allPayments = serviceObj.monthlyAccounting?.paymets || [];

      const servicePayments = allPayments.filter(
        (p: any) => p.accountingServiceId === service.id,
      );

      const paidAmount = servicePayments.reduce(
        (acc: number, p: any) => acc + (p.amount || 0),
        0,
      );

      const debtAmount = Math.max(0, (service.amount || 0) - paidAmount);


      return {
        id: service.id,
        description: service.services?.description ?? '',
        name: service.services?.name ?? '',
        amount: service.amount,
        status: service.status,
        monthlyAccountingId: service.monthlyAccountingId,
        servicesId: service.servicesId,
        paid: paidAmount,
        debt: debtAmount,
        month: service.monthlyAccounting.month
      };
    });
  }
}
