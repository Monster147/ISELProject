package pt.ira.interfaces

/**
 * *Interface* genérica de repositório para operações básicas de CRUD.
 *
 * Define o contrato mínimo que todos os repositórios do sistema devem implementar,
 * independentemente da entidade gerida ou da tecnologia de persistência subjacente.
 *
 * @param T Tipo da entidade gerida pelo repositório.
 */
interface Repository<T> {
    /**
     * Obtém uma entidade pelo seu identificador.
     *
     * @param id Identificador único da entidade.
     * @return A entidade correspondente, ou null caso não exista.
     */
    fun findById(id: Int): T?

    /**
     * Obtém todas as entidades do repositório.
     *
     * @return Lista com todas as entidades existentes.
     */
    fun findAll(): List<T>

    /**
     * Persiste uma entidade, criando-a ou atualizando-a caso já exista.
     *
     * @param entity Entidade a persistir.
     */
    fun save(entity: T)

    /**
     * Remove uma entidade pelo seu identificador.
     *
     * @param id Identificador único da entidade a remover.
     */
    fun deleteById(id: Int)

    /**
     * Remove todas as entidades do repositório.
     */
    fun clear()
}
