/**
 * Tipo recursivo que representa qualquer valor JSON válido.
 *
 * Cobre todos os casos possíveis da especificação JSON: null, booleanos, números,
 * strings, arrays e objetos. Útil para tipar campos dinâmicos como `occurrenceInfo`
 * ou `form` sem perder segurança de tipos.
 *
 * @see https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081
 */
export type Json =
  null | boolean | number | string | Json[] | { [prop: string]: Json };
