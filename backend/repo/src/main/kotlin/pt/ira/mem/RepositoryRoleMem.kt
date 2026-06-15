package pt.ira.mem

import pt.ira.interfaces.RepositoryRole
import pt.ira.role.Role

class RepositoryRoleMem : RepositoryRole {
    private val roles =
        mutableListOf(
            Role(1, "admin"),
            Role(2, "investigator"),
            Role(3, "supervisor"),
        )

    override fun createRole(name: String): Role = Role(roles.size + 1, name).also { roles.add(it) }

    override fun deleteRoleByName(name: String) {
        roles.removeIf { it.displayName == name }
    }

    override fun findByName(name: String): Role? = roles.find { it.displayName == name }

    override fun findById(id: Int): Role? = roles.find { it.id == id }

    override fun findAll(): List<Role> = roles.toList()

    override fun save(entity: Role) {
        val idx = roles.indexOfFirst { it.id == entity.id }
        if (idx >= 0) {
            roles[idx] = entity
        } else {
            roles.add(entity)
        }
    }

    override fun deleteById(id: Int) {
        roles.removeIf { it.id == id }
    }

    override fun clear() = roles.clear()
}
