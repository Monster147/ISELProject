package pt.ira.mem

import pt.ira.interfaces.Transaction
import pt.ira.interfaces.TransactionManager

class TransactionManagerInMem : TransactionManager {
    private val repoUsers = RepositoryUserMem()
    private val repoReports = RepositoryReportMem()
    private val repoEvidence = RepositoryEvidenceMem()
    private val repoIntervenor = RepositoryIntervenorMem()
    private val repoRole = RepositoryRoleMem()

    override fun <R> run(block: Transaction.() -> R): R =
        block(
            TransactionInMem(repoUsers, repoIntervenor, repoReports, repoEvidence, repoRole),
        )
}
