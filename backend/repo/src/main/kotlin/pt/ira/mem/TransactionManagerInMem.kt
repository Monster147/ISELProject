package pt.ira.mem

import pt.ira.interfaces.Transaction
import pt.ira.interfaces.TransactionManager

/**
 * Implementação em memória de [TransactionManager].
 *
 * Utilizada exclusivamente para testes, mantém instâncias partilhadas de todos os
 * repositórios em memória e executa os blocos de código diretamente, sem suporte
 * real a transações ou rollback.
 *
 * @see TransactionInMem
 * @see TransactionManager
 */
class TransactionManagerInMem : TransactionManager {
    private val repoUsers = RepositoryUserMem()
    private val repoReports = RepositoryReportMem()
    private val repoEvidence = RepositoryEvidenceMem()
    private val repoIntervenor = RepositoryIntervenorMem()
    private val repoRole = RepositoryRoleMem()
    private val repoOccurrence = RepositoryOccurrenceMem()
    private val repoDocuments = RepositoryDocumentsMem()
    private val repoType = RepositoryTypeMem()

    /**
     * Executa o bloco fornecido com uma instância de [TransactionInMem].
     *
     * Não oferece garantias transacionais, ou seja, o bloco é executado diretamente
     * sobre os repositórios em memória, sem confirmação ou reversão.
     *
     * @param R Tipo do valor de retorno do bloco.
     * @param block Bloco a executar no contexto da transação em memória.
     * @return O valor retornado pelo bloco.
     */
    override fun <R> run(block: Transaction.() -> R): R =
        block(
            TransactionInMem(
                repoUsers,
                repoIntervenor,
                repoReports,
                repoEvidence,
                repoRole,
                repoOccurrence,
                repoDocuments,
                repoType,
            ),
        )
}
