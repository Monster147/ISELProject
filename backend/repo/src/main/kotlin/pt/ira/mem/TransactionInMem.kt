package pt.ira.mem

import pt.ira.interfaces.RepositoryDocuments
import pt.ira.interfaces.RepositoryEvidence
import pt.ira.interfaces.RepositoryIntervenor
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.interfaces.RepositoryReport
import pt.ira.interfaces.RepositoryRole
import pt.ira.interfaces.RepositoryType
import pt.ira.interfaces.RepositoryUser
import pt.ira.interfaces.Transaction

/**
 * Implementação em memória de [Transaction].
 *
 * Utilizada exclusivamente para testes, recebe as instâncias dos repositórios
 * em memória como dependências, permitindo isolar a lógica de negócio da persistência real.
 * O método [rollback] não é suportado por esta implementação.
 *
 * @param repoUsers Repositório de utilizadores em memória.
 * @param repoIntervenor Repositório de intervenientes em memória.
 * @param repoReport Repositório de relatórios em memória.
 * @param repoEvidence Repositório de evidências em memória.
 * @param repoRole Repositório de cargos em memória.
 * @param repoOccurrence Repositório de ocorrências em memória.
 * @param repoDocuments Repositório de documentos em memória.
 * @param repoType Repositório de tipos em memória.
 *
 * @see TransactionManagerInMem
 * @see Transaction
 */
class TransactionInMem(
    override val repoUsers: RepositoryUser,
    override val repoIntervenor: RepositoryIntervenor,
    override val repoReport: RepositoryReport,
    override val repoEvidence: RepositoryEvidence,
    override val repoRole: RepositoryRole,
    override val repoOccurrence: RepositoryOccurrence,
    override val repoDocuments: RepositoryDocuments,
    override val repoType: RepositoryType,
) : Transaction {
    /**
     * Não suportado nesta implementação em memória.
     *
     * @throws UnsupportedOperationException sempre que invocado.
     */
    override fun rollback(): Unit = throw UnsupportedOperationException()
}
