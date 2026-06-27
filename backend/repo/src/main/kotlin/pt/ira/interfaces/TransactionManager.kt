package pt.ira.interfaces

/**
 * Define o contrato para a gestão de transações no sistema.
 *
 * Responsável por criar e gerir o ciclo de vida de instâncias de [Transaction],
 * garantindo que cada bloco de código é executado numa.
 * Em caso de exceção, a transação deve ser revertida automaticamente.
 *
 * @see Transaction
 */
interface TransactionManager {
    /**
     * Executa um bloco de código numa transação.
     *
     * Cria uma instância de [Transaction], podendo inicializar uma ligação JDBC,
     * um Handle do JDBI, ou outro recurso transacional, passado como recetor
     * do bloco fornecido. Em caso de exceção não capturada, a transação é revertida.
     *
     * @param R Tipo do valor de retorno do bloco.
     * @param block Bloco a executar no contexto da transação.
     * @return O valor retornado pelo bloco.
     */
    fun <R> run(block: Transaction.() -> R): R
}
