package pt.ira.interfaces

/**
 * O ciclo de vida de uma Transaction é gerido fora do âmbito do contentor de IoC/DI.
 * As transações são instanciadas por um TransactionManager,
 * gerido pelo contentor de IoC/DI (ex: Spring).
 * A implementação de Transaction é responsável por criar as
 * instâncias necessárias de repositórios no seu construtor.
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

    fun rollback()
}
