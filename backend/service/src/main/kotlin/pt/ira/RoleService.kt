package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.role.Role

sealed class RoleError {
    data object RoleAlreadyExists : RoleError()

    data object RoleNotFound : RoleError()
}

@Component
class RoleService(
    private val trxManager: TransactionManager,
) {
    fun createRole(name: String): Either<RoleError, Role> {
        return trxManager.run {
            if (repoRole.findByName(name) != null) {
                return@run failure(RoleError.RoleAlreadyExists)
            }
            val role = repoRole.createRole(name)
            success(role)
        }
    }

    fun deleteRoleByName(name: String): Either<RoleError, Unit> {
        return trxManager.run {
            if (repoRole.findByName(name) == null) return@run failure(RoleError.RoleNotFound)
            repoRole.deleteRoleByName(name)
            success(Unit)
        }
    }

    fun findByName(name: String): Either<RoleError, Role> {
        return trxManager.run {
            val role = repoRole.findByName(name) ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    fun findById(id: Int): Either<RoleError, Role> {
        return trxManager.run {
            val role = repoRole.findById(id) ?: return@run failure(RoleError.RoleNotFound)
            success(role)
        }
    }

    fun findAllRoles(): List<Role> {
        return trxManager.run {
            repoRole.findAll()
        }
    }
}
