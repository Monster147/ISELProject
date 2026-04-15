package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.role.Role

sealed class RoleError {
    data object RoleAlreadyExists : RoleError()

    data object RoleNotFound : RoleError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos papéis (roles).
 *
 * Responsabilidades principais:
 * - criação, consulta e eliminação de papéis;
 * - validação de unicidade de nomes;
 * - disponibilização de dados de papéis do sistema.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 */
@Component
class RoleService(
    private val trxManager: TransactionManager,
) {
    /**
     * Cria um papel.
     *
     * Valida se já existe um papel com o mesmo nome.
     *
     * @param name Nome do papel.
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
     * Remove um papel com base no nome.
     *
     * Valida a existência do papel antes da eliminação.
     *
     * @param name Nome do papel.
     *
     * @return [Unit] se a eliminação for bem-sucedida, ou erro do tipo [RoleError].
     */
    fun deleteRoleByName(name: String): Either<RoleError, Unit> {
        return trxManager.run {
            if (repoRole.findByName(name) == null) return@run failure(RoleError.RoleNotFound)
            repoRole.deleteRoleByName(name)
            success(Unit)
        }
    }

    /**
     * Obtém um papel pelo nome.
     *
     * @param name Nome do papel.
     *
     * @return [Role] correspondente, ou erro do tipo [RoleError].
     */
    fun findByName(name: String): Either<RoleError, Role> {
        return trxManager.run {
            val role = repoRole.findByName(name) ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    /**
     * Obtém um papel pelo identificador.
     *
     * @param id Identificador do papel.
     *
     * @return [Role] correspondente, ou erro do tipo [RoleError].
     */
    fun findById(id: Int): Either<RoleError, Role> {
        return trxManager.run {
            val role = repoRole.findById(id) ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    /**
     * Obtém todos os papéis registados no sistema.
     *
     * @return Lista de todas as [Role].
     */
    fun findAllRoles(): List<Role> {
        return trxManager.run {
            repoRole.findAll()
        }
    }
}
