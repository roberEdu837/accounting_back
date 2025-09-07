export function formatDatePrettyFromString(date: string) {
  const [year, month, day] = date.split('-');
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
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

export function getPaymentDate(date: Date): string {
  const baseDate = date.toISOString().split('T')[0];
  const [year, month, day] = baseDate.split('-');
  const newYear = Number(year) + 4;
  return `${newYear}-${month}-${day}`;
}
