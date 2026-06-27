package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.interfaces.Transaction

/**
 * Implementação de [Transaction] baseada em JDBI.
 *
 * Cria as instâncias dos repositórios JDBI a partir de um [Handle] partilhado,
 * garantindo que todas as operações realizadas numa transação usam
 * a mesma ligação à base de dados.
 *
 * @param handle Handle JDBI que encapsula a ligação e a transação ativa.
 *
 * @see TransactionManagerJdbi
 * @see Transaction
 */
class TransactionInJdbi(
    private val handle: Handle,
) : Transaction {
    override val repoUsers = RepositoryUserJdbi(handle)
    override val repoIntervenor = RepositoryIntervenorJdbi(handle)
    override val repoReport = RepositoryReportJdbi(handle)
    override val repoEvidence = RepositoryEvidenceJdbi(handle)
    override val repoRole = RepositoryRoleJdbi(handle)
    override val repoOccurrence = RepositoryOccurrenceJdbi(handle)
    override val repoDocuments = RepositoryDocumentsJdbi(handle)
    override val repoType = RepositoryTypeJdbi(handle)

    /**
     * Reverte a transação atual através do handle JDBI.
     */
    override fun rollback() {
        handle.rollback()
    }
}
