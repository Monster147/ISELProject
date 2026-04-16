package pt.ira.mem

import pt.ira.documents.Documents
import pt.ira.interfaces.RepositoryDocuments

class RepositoryDocumentsMem : RepositoryDocuments {
    private val docsList = mutableListOf<Documents>()

    override fun uploadDocumentInfo(
        name: String,
        type: String,
        filepath: String,
    ): Documents =
        Documents(
            id = docsList.size + 1,
            name = name,
            type = type,
            filepath = filepath,
        ).also {
            docsList.add(it)
            println(docsList)
        }

    override fun findAllTypes(): List<String> = docsList.map { it.type }

    override fun findByName(name: String): Documents? = docsList.firstOrNull { it.name == name }

    override fun findByType(type: String): List<Documents> = docsList.filter { it.type == type }

    override fun findById(id: Int): Documents? = docsList.firstOrNull { it.id == id }

    override fun findAll(): List<Documents> = docsList.toList()

    override fun save(entity: Documents) {
        docsList.removeIf { it.id == entity.id }
        docsList.add(entity)
    }

    override fun deleteById(id: Int) {
        docsList.removeIf { it.id == id }
    }

    override fun clear() {
        docsList.clear()
    }
}
