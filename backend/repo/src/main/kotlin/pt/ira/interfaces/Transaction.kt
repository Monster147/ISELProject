package pt.ira.interfaces

/**
 * Representa uma unidade de trabalho transacional que agrega os repositórios do sistema.
 *
 * O ciclo de vida de uma [Transaction] é gerido fora do âmbito do contentor de IoC/DI.
 * As transações são instanciadas por um [TransactionManager], que por sua vez é
 * gerido pelo contentor de IoC/DI (ex: Spring).
 * A implementação de [Transaction] é responsável por criar as instâncias necessárias
 * de repositórios no seu construtor.
 *
 * @property repoUsers Repositório de utilizadores.
 * @property repoIntervenor Repositório de intervenientes.
 * @property repoReport Repositório de relatórios.
 * @property repoEvidence Repositório de evidências.
 * @property repoRole Repositório de cargos.
 * @property repoOccurrence Repositório de ocorrências.
 * @property repoDocuments Repositório de documentos.
 * @property repoType Repositório de tipos de ocorrência.
 *
 * @see TransactionManager
 */
interface Transaction {
    val repoUsers: RepositoryUser
    val repoIntervenor: RepositoryIntervenor
    val repoReport: RepositoryReport
    val repoEvidence: RepositoryEvidence
    val repoRole: RepositoryRole
    val repoOccurrence: RepositoryOccurrence
    val repoDocuments: RepositoryDocuments
    val repoType: RepositoryType

    /**
     * Reverte todas as operações realizadas no âmbito desta transação.
     */
    fun rollback()
}
