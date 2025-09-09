import {monthsPdf} from '../conts';

export function formatDatePretty(date: string | Date) {
  let d: Date;

  if (typeof date === 'string') {
    // Si es string tipo "YYYY-MM-DD"
    d = new Date(date);
  } else {
    // Si ya es un objeto Date
    d = date;
  }

  const day = d.getDate();
  const month = d.getMonth(); // 0-11
  const year = d.getFullYear();

  const monthNames = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  return `${day} ${monthNames[month]} ${year}`;
}

export function paymentDateToString(date: Date): string {
  const baseDate = date.toISOString().split('T')[0];
  const [year, month, day] = baseDate.split('-');
  return `${year}-${month}-${day}`;
}

export function getPeriodText(
  month: number,
  year: number,
  periodicity?: string,
): string {
  if (periodicity === 'BIMESTRAL') {
    const month1 = monthsPdf.find(m => m.value === month)?.label;
    const month2 = monthsPdf.find(m => m.value === month + 1)?.label;
    return `PERIODO: ${month1} - ${month2} / ${year}`;
  } else {
    const monthLabel = monthsPdf.find(m => m.value === month)?.label;
    return `PERIODO: ${monthLabel} / ${year}`;
  }
}
