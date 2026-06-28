/**
 * Dados para atualizar um interveniente. Campos nulos são ignorados pelo servidor.
 * @property idNumber Novo número de identificação, ou null.
 * @property idType Novo tipo de documento, ou null.
 * @property name Novo nome, ou null.
 * @property contactInfo Nova informação de contacto, ou null.
 * @property address Nova morada, ou null.
 */
export interface IntervenorUpdateInput {
  idNumber: string | null;
  idType: string | null;
  name: string | null;
  contactInfo: string | null;
  address: string | null;
}
