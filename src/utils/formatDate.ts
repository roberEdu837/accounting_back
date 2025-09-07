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
