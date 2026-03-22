package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.Intervenor
import pt.ira.interfaces.RepositoryIntervenor
import pt.ira.interfaces.RepositoryUser

class RepositoryIntervenorJdbi(
    private val handle: Handle
) : RepositoryIntervenor {
    override fun createIntervenor(
        idNumber: String,
        idType: String,
        name: String,
        contactInfo: String,
        address: String
    ): Intervenor {
        TODO("Not yet implemented")
    }

    override fun updateIntervenor(
        intervenor: Intervenor,
        idNumber: String?,
        idType: String?,
        name: String?,
        contactInfo: String?,
        address: String?
    ): Intervenor {
        TODO("Not yet implemented")
    }

    override fun findByIdNumber(idNumber: String): Intervenor? {
        TODO("Not yet implemented")
    }

    override fun findByContactInfo(contactInfo: String): Intervenor? {
        TODO("Not yet implemented")
    }

    override fun findById(id: Int): Intervenor? {
        TODO("Not yet implemented")
    }

    override fun findAll(): List<Intervenor> {
        TODO("Not yet implemented")
    }

    override fun save(entity: Intervenor) {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: Int) {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }
}