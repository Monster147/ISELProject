package pt.ira.interfaces

import pt.ira.role.Role

/**
 * Repositório de operações sobre cargos (roles).
 */
interface RepositoryRole : Repository<Role> {
    /**
     * Cria um cargo (role) com o nome indicado.
     *
     * @param name Nome legível do cargo.
     *
     * @return [Role] criado.
     */
    fun createRole(name: String): Role

    /**
     * Remove um cargo (role) pelo seu nome.
     *
     * @param name Nome do cargo a remover.
     */
    fun deleteRoleByName(name: String)

    /**
     * Procura um cargo (role) pelo seu nome.
     *
     * @param name Nome do cargo a procurar.
     *
     * @return [Role] correspondente, ou null caso não exista.
     */
    fun findByName(name: String): Role?
}
