package pt.ira.interfaces

import pt.ira.role.Role

/**
 * Repositório de operações sobre papéis (roles).
 */
interface RepositoryRole : Repository<Role> {
    /**
     * Cria um papel (role) com o nome indicado.
     *
     * @param name Nome legível do papel.
     *
     * @return [Role] criado.
     */
    fun createRole(name: String): Role

    /**
     * Remove um papel (role) pelo seu nome.
     *
     * @param name Nome do papel a remover.
     */
    fun deleteRoleByName(name: String)

    /**
     * Procura um papel (role) pelo seu nome.
     *
     * @param name Nome do papel a procurar.
     *
     * @return [Role] correspondente, ou null caso não exista.
     */
    fun findByName(name: String): Role?
}
