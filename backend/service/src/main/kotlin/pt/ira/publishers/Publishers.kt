package pt.ira.publishers

import jakarta.inject.Named

/**
 * Agregador centralizado de publishers responsáveis pela difusão de eventos de atualização.
 *
 * Esta classe gere um conjunto de publishers especializados, cada um dedicado a uma entidade
 * do domínio (como Ocorrências, Relatórios, Evidências). Atua como um registry
 * que facilita o acesso aos canais de publicação para os diferentes tipos de entidades,
 * permitindo que os serviços notifiquem os clientes conectados via SSE quando mudanças
 * ocorrem no sistema.
 *
 * A anotação [@Named] integra esta classe no contentor de injeção de dependências do Spring,
 * permitindo que seja injetada nos serviços que necessitem de acesso aos publishers.
 *
 * @property evidencePublisher Publisher para eventos de atualização de uma evidência individual.
 * @property intervenorPublisher Publisher para eventos de atualização de um interveniente individual.
 * @property intervenorsPublisher Publisher para eventos de atualização de múltiplos intervenientes.
 * @property occurrencePublisher Publisher para eventos de atualização de uma ocorrência individual.
 * @property occurrencesPublisher Publisher para eventos de atualização de múltiplas ocorrências.
 * @property reportPublisher Publisher para eventos de atualização de um relatório individual.
 * @property documentsPublisher Publisher para eventos de atualização de múltiplos documentos.
 * @property typesPublisher Publisher para eventos de atualização de múltiplos tipos.
 *
 * @see ClassPublisher
 * @see ClassesPublisher
 */

@Named
class Publishers {
    val evidencePublisher = ClassPublisher()
    val intervenorPublisher = ClassPublisher()
    val intervenorsPublisher = ClassesPublisher()
    val occurrencePublisher = ClassPublisher()
    val occurrencesPublisher = ClassPublisher()
    val reportPublisher = ClassPublisher()
    val documentsPublisher = ClassesPublisher()
    val typesPublisher = ClassesPublisher()
}
