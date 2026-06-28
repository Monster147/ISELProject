/**
 * Tipos de campo suportados nos formulários dinâmicos de ocorrências.
 * `string`/`text`: Texto. `number`: Numérico. `boolean`: Verdadeiro/falso.
 * `select`: Lista de opções. `datetime`: Data/hora. `image`: Imagem. `file`: Ficheiro.
 */

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "datetime"
  | "text"
  | "image"
  | "file";
