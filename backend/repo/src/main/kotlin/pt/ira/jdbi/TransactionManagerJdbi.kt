package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import pt.ira.interfaces.Transaction
import pt.ira.interfaces.TransactionManager

/**
 * Implementação de [TransactionManager] baseada em JDBI.
 *
 * Gere o ciclo de vida das transações utilizando o mecanismo `inTransaction` do JDBI,
 * que abre um handle, executa o bloco fornecido e confirma ou reverte a transação
 * automaticamente consoante o resultado.
 *
 * @param jdbi Instância de [Jdbi] usada para criar os handles de ligação à base de dados.
 *
 * @see TransactionInJdbi
 * @see TransactionManager
 */
class TransactionManagerJdbi(
    private val jdbi: Jdbi,
) : TransactionManager {
    /**
     * Executa o bloco fornecido numa transação JDBI.
     *
     * Abre um handle, cria uma instância de [TransactionInJdbi] e executa o bloco.
     * A transação é confirmada em caso de sucesso ou revertida em caso de exceção.
     *
     * @param R Tipo do valor de retorno do bloco.
     * @param block Bloco a executar no contexto da transação.
     * @return O valor retornado pelo bloco.
     */
    override fun <R> run(block: Transaction.() -> R): R {
        return jdbi.inTransaction<R, Exception> { handle ->
            val transaction = TransactionInJdbi(handle)
            block(transaction)
        }
    }
}
