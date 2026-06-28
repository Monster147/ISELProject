/**
 * Dados necessários para criar uma nova evidência.
 * @property type Tipo da evidência.
 * @property location Localização onde foi recolhida.
 * @property description Descrição da evidência.
 * @property reporterId Identificador do utilizador que a regista.
 * @property occurrenceId Identificador da ocorrência associada.
 */
export interface CreateEvidenceInput {
  type: string;
  location: string;
  description: string;
  reporterId: number;
  occurrenceId: number;
}
