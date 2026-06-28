/**
 * Dados para criar um interveniente.
 * @property idNumber Número de identificação.
 * @property idType Tipo de documento de identificação.
 * @property name Nome completo.
 * @property contactInfo Informação de contacto.
 * @property address Morada.
 */
export interface IntervenorInput {
  idNumber: string;
  idType: string;
  name: string;
  contactInfo: string;
  address: string;
}
