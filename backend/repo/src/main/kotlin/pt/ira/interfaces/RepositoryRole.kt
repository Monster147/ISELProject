package pt.ira.interfaces

import pt.ira.role.Role

interface RepositoryRole : Repository<Role> {
    fun createRole(name: String): Role

    fun deleteRoleByName(name: String)

    fun findByName(name: String): Role?
}
