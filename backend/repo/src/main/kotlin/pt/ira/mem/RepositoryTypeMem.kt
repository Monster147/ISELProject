package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.interfaces.RepositoryType
import pt.ira.type.Type

class RepositoryTypeMem : RepositoryType {
    private val types = mutableListOf<Type>()
    override fun createType(name: String, form: JsonNode): Type =
        Type(
            id = types.size+1,
            name = name,
            form = form,
        ).also{ types.add(it) }

    override fun findByName(name: String): Type? = types.find { it.name == name }

    override fun findById(id: Int): Type? = types.find { it.id == id }

    override fun findAll(): List<Type> = types.toList()

    override fun save(entity: Type) {
        types.removeIf { it.id == entity.id }
        types.add(entity)
    }

    override fun deleteById(id: Int) {
        types.removeIf { it.id == id }
    }

    override fun clear() {
        types.clear()
    }
}