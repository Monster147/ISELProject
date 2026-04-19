package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.interfaces.Transaction

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

    override fun rollback() {
        handle.rollback()
    }
}
