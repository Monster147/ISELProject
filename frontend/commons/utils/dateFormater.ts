/**
 * Converte uma data do formato ISO (`YYYY-MM-DD`) para o formato de apresentação (`DD/MM/YYYY`).
 *
 * @param date Data no formato `YYYY-MM-DD`.
 * @returns Data formatada como `DD/MM/YYYY`, ou a string original se o formato for inválido.
 */
function dateFormater(date: string) {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}

export default dateFormater;
