package pt.ira.mem

import pt.ira.role.Role
import pt.ira.interfaces.RepositoryRole

class RepositoryRoleMem: RepositoryRole {
    private val roles = mutableListOf(
        Role(1, "admin"),
        Role(2, "investigator"),
        Role(3, "supervisor")
    )

    override fun createRole(name: String): Role = Role(roles.size+1, name).also { roles.add(it) }

    override fun deleteRoleByName(name: String) {
        roles.removeIf { it.displayName == name }
    }

    override fun findByName(name: String): Role? = roles.find { it.displayName == name }

    override fun findById(id: Int): Role? {
        return roles.find { it.id == id }
    }

    override fun findAll(): List<Role> {
        return roles.toList()
    }

    override fun save(entity: Role) {
        roles.removeIf { it.id == entity.id }
        roles.add(entity)
    }

    override fun deleteById(id: Int){
       roles.removeIf { it.id == id }
    }

    override fun clear() {
       roles.clear()
    }
}