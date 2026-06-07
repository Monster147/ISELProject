package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.role.Role

/**
 * Hierarquia de erros específicos do domínio dos cargos.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com cargos,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see ReportService
 */
sealed class RoleError {
    /**
     * Um cargo com o nome especificado já existe no sistema.
     */
    data object RoleAlreadyExists : RoleError()

    /**
     * O cargo solicitado não foi encontrado no sistema,
     * quer por nome quer por identificador.
     */
    data object RoleNotFound : RoleError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos cargos (roles).
 *
 * Responsabilidades principais:
 * - criação, consulta e eliminação de cargos;
 * - validação de unicidade de nomes;
 * - disponibilização de dados de cargos do sistema.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 */
@Component
class RoleService(
    private val trxManager: TransactionManager,
) {
    /**
     * Cria um cargo.
     *
     * Valida se já existe um cargo com o mesmo nome.
     *
     * @param name Nome do cargo.
     *
     * @return [Role] criado, ou um erro do tipo [RoleError].
     */
    fun createRole(name: String): Either<RoleError, Role> {
        return trxManager.run {
            if (repoRole.findByName(name) != null) {
                return@run failure(RoleError.RoleAlreadyExists)
            }
            val role = repoRole.createRole(name)
            success(role)
        }
    }

    /**
     * Remove um cargo com base no nome.
     *
     * Valida a existência do cargo antes da eliminação.
     *
     * @param name Nome do cargo.
     *
     * @return [Unit] se a eliminação for bem-sucedida, ou erro do tipo [RoleError].
     */
    fun deleteRoleByName(name: String): Either<RoleError, Unit> {
        return trxManager.run {
            if (repoRole.findByName(name) == null) {
                return@run failure(RoleError.RoleNotFound)
            }
            repoRole.deleteRoleByName(name)
            success(Unit)
        }
    }

    /**
     * Obtém um cargo pelo nome.
     *
     * @param name Nome do cargo.
     *
     * @return [Role] correspondente, ou erro do tipo [RoleError].
     */
    fun findByName(name: String): Either<RoleError, Role> {
        return trxManager.run {
            val role =
                repoRole.findByName(name)
                    ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    /**
     * Obtém um cargo pelo identificador.
     *
     * @param id Identificador do cargo.
     *
     * @return [Role] correspondente, ou erro do tipo [RoleError].
     */
    fun findById(id: Int): Either<RoleError, Role> {
        return trxManager.run {
            val role =
                repoRole.findById(id)
                    ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    /**
     * Obtém todos os cargos registados no sistema.
     *
     * @return Lista de todas as [Role].
     */
    fun findAllRoles(): List<Role> {
        return trxManager.run {
            repoRole.findAll()
        }
    }
}
