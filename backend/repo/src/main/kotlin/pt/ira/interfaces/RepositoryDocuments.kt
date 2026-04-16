package pt.ira.interfaces

import pt.ira.documents.Documents

interface RepositoryDocuments : Repository<Documents> {
    fun uploadDocumentInfo(
        name: String,
        type: String,
        filepath: String,
    ): Documents

    fun findAllTypes(): List<String>

    fun findByName(name: String): Documents?

    fun findByType(type: String): List<Documents>
}
