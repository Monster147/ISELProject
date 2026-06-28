/**
 * Converte uma data do formato de apresentação (`DD/MM/YYYY`) para o formato ISO (`YYYY/MM/DD`).
 * Útil para converter datas introduzidas pelo utilizador de volta ao formato aceite pela API.
 *
 * @param date Data no formato `DD/MM/YYYY`.
 * @returns Data no formato `YYYY/MM/DD`, ou a string original se o formato for inválido.
 */
function inverseDateFormater(date: string) {
  const [d, m, y] = date.split("/");
  if (!d || !m || !y) return date;
  return `${y}/${m}/${d}`;
}

export default inverseDateFormater;
