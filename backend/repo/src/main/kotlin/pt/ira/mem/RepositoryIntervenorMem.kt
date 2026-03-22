package pt.ira.mem

import pt.ira.Intervenor
import pt.ira.interfaces.RepositoryIntervenor

class RepositoryIntervenorMem: RepositoryIntervenor {
    private val intervenors = mutableListOf<Intervenor>()

    override fun findByIdNumber(idNumber: String): Intervenor? {
        return intervenors.find { it.idNumber == idNumber }
    }

    override fun findByContactInfo(contactInfo: String): Intervenor? = intervenors.find { it.contactInfo == contactInfo }

    override fun findById(id: Int): Intervenor? = intervenors.find { it.id == id }

    override fun findAll(): List<Intervenor> {
        return intervenors.toList()
    }

    override fun save(entity: Intervenor) {
        intervenors.removeIf { it.id == entity.id }
        intervenors.add(entity)
    }

    override fun deleteById(id: Int) {
        intervenors.removeIf { it.id == id }
    }

    override fun clear() {
        intervenors.clear()
    }
}