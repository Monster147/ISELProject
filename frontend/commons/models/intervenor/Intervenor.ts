/**
 * Representa um interveniente registado no sistema.
 * @property id Identificador único.
 * @property idNumber Número de identificação (ex: BI, NIF, passaporte).
 * @property idType Tipo de documento de identificação.
 * @property name Nome completo.
 * @property contactInfo Informação de contacto.
 * @property address Morada.
 */
export interface Intervenor {
  id: number;
  idNumber: string;
  idType: string;
  name: string;
  contactInfo: string;
  address: string;
}
