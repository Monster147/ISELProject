package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import pt.ira.interfaces.Transaction
import pt.ira.interfaces.TransactionManager

class TransactionManagerJdbi(
    private val jdbi: Jdbi,
) : TransactionManager {
    override fun <R> run(block: Transaction.() -> R): R {
        return jdbi.inTransaction<R, Exception> { handle ->
            val transaction = TransactionInJdbi(handle)
            block(transaction)
        }
    }
}
