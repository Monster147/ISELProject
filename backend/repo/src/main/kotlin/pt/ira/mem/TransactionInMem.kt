package pt.ira.mem

import pt.ira.interfaces.RepositoryEvidence
import pt.ira.interfaces.RepositoryIntervenor
import pt.ira.interfaces.RepositoryReport
import pt.ira.interfaces.RepositoryUser
import pt.ira.interfaces.Transaction

class TransactionInMem(
    override val repoUsers: RepositoryUser,
    override val repoIntervenor: RepositoryIntervenor,
    override val repoReport: RepositoryReport,
    override val repoEvidence: RepositoryEvidence
) : Transaction {
    override fun rollback(): Unit = throw UnsupportedOperationException()
}