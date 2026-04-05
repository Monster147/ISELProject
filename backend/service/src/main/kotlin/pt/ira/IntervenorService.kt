package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.intervenor.Intervenor

sealed class IntervenorError {
    data object IntervenorAlreadyExists : IntervenorError()

    data object IntervenorNotFound : IntervenorError()
}

@Component
class IntervenorService(
    private val trxManager: TransactionManager,
) {
    fun createIntervenor(
        idNumber: String,
        idType: String,
        name: String,
        contactInfo: String,
        address: String,
    ): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val existing = repoIntervenor.findByIdNumber(idNumber)
            if (existing != null && existing.idType == idType) {
                return@run failure(IntervenorError.IntervenorAlreadyExists)
            }
            val existingByContact = repoIntervenor.findByContactInfo(contactInfo)
            if (existingByContact != null) {
                return@run failure(IntervenorError.IntervenorAlreadyExists)
            }
            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = idNumber,
                    idType = idType,
                    name = name,
                    contactInfo = contactInfo,
                    address = address,
                )
            success(intervenor)
        }
    }

    fun updateIntervenor(
        intervenorId: Int,
        idNumber: String?,
        idType: String?,
        name: String?,
        contactInfo: String?,
        address: String?,
    ): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findById(intervenorId) ?: return@run failure(IntervenorError.IntervenorNotFound)
            val updatedIntervenor =
                repoIntervenor.updateIntervenor(
                    intervenor = intervenor,
                    idNumber = idNumber,
                    idType = idType,
                    name = name,
                    contactInfo = contactInfo,
                    address = address,
                )
            success(updatedIntervenor)
        }
    }

    fun deleteIntervenorByIdNumber(idNumber: String): Either<IntervenorError, Boolean> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByIdNumber(idNumber) ?: return@run failure(IntervenorError.IntervenorNotFound)
            repoIntervenor.deleteById(intervenor.id)
            success(true)
        }
    }

    fun findByIntervenorByIdNumber(idNumber: String): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByIdNumber(idNumber) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    fun findByIntervenorContactInfo(contactInfo: String): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByContactInfo(contactInfo) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    fun findByID(id: Int): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findById(id) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    fun findAll(): List<Intervenor> = trxManager.run { repoIntervenor.findAll() }
}
