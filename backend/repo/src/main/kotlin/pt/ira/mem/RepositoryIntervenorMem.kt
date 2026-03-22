package pt.ira.mem

import pt.ira.Intervenor
import pt.ira.interfaces.RepositoryIntervenor

class RepositoryIntervenorMem: RepositoryIntervenor {
    private val intervenors = mutableListOf<Intervenor>()
    override fun createIntervenor(
        idNumber: String,
        idType: String,
        name: String,
        contactInfo: String,
        address: String
    ): Intervenor = Intervenor(
        id = intervenors.size + 1,
        idNumber = idNumber,
        idType = idType,
        name = name,
        contactInfo = contactInfo,
        address = address
    ).also { intervenors.add(it) }

    override fun updateIntervenor(
        intervenor: Intervenor,
        idNumber: String?,
        idType: String?,
        name: String?,
        contactInfo: String?,
        address: String?
    ): Intervenor {
        val updatedIntervenor = intervenor.copy(
            idNumber = idNumber ?: intervenor.idNumber,
            idType = idType ?: intervenor.idType,
            name = name ?: intervenor.name,
            contactInfo = contactInfo ?: intervenor.contactInfo,
            address = address ?: intervenor.address
        )
        save(updatedIntervenor)
        return updatedIntervenor
    }

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