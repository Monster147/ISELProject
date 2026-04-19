package pt.ira

import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.intervenor.Intervenor
import pt.ira.publishers.Publishers

sealed class IntervenorError {
    data object IntervenorAlreadyExists : IntervenorError()

    data object IntervenorNotFound : IntervenorError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos intervenientes.
 *
 * Responsabilidades principais:
 * - criação, atualização, consulta e eliminação de intervenientes;
 * - validação de unicidade com base no número de identificação e contacto;
 * - publicação de eventos relacionados com alterações de intervenientes.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class IntervenorService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers,
) {
    /**
     * Cria um interveniente.
     *
     * Valida se já existe um interveniente com o mesmo número e tipo de identificação
     * ou com a mesma informação de contacto. Em caso afirmativo, a operação falha.
     * Após criação, publica eventos de criação e atualização da lista de intervenientes.
     *
     * @param idNumber Número de identificação do interveniente.
     * @param idType Tipo de identificação (ex: CC, NIF, Passaporte).
     * @param name Nome do interveniente ou entidade.
     * @param contactInfo Informação de contacto.
     * @param address Morada do interveniente.
     *
     * @return [Intervenor] criado, ou um erro do tipo [IntervenorError].
     */
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
            publisher.intervenorPublisher.sendMessageToAll(
                intervenor.id,
                intervenor,
                ActionKind.IntervenorCreated,
            )
            publisher.intervenorsPublisher.sendMessageToAll(
                findAll(),
                ActionKind.IntervenorsChanged,
            )
            success(intervenor)
        }
    }

    /**
     * Atualiza um interveniente existente.
     *
     * Apenas os campos não nulos são atualizados.
     * Publica eventos de atualização e alteração da lista de intervenientes.
     *
     * @param intervenorId Identificador do interveniente.
     * @param idNumber Novo número de identificação (opcional).
     * @param idType Novo tipo de identificação (opcional).
     * @param name Novo nome (opcional).
     * @param contactInfo Nova informação de contacto (opcional).
     * @param address Nova morada (opcional).
     *
     * @return [Intervenor] atualizado, ou um erro do tipo [IntervenorError].
     */
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
            publisher.intervenorPublisher.sendMessageToAll(
                updatedIntervenor.id,
                updatedIntervenor,
                ActionKind.IntervenorUpdated,
            )
            publisher.intervenorsPublisher.sendMessageToAll(
                findAll(),
                ActionKind.IntervenorsChanged,
            )
            success(updatedIntervenor)
        }
    }

    /**
     * Remove um interveniente com base no número de identificação.
     *
     * Publica eventos de eliminação e atualização da lista de intervenientes.
     *
     * @param idNumber Número de identificação do interveniente.
     *
     * @return `true` se a eliminação for bem-sucedida, ou erro do tipo [IntervenorError].
     */
    fun deleteIntervenorByIdNumber(idNumber: String): Either<IntervenorError, Boolean> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByIdNumber(idNumber) ?: return@run failure(IntervenorError.IntervenorNotFound)
            repoIntervenor.deleteById(intervenor.id)
            publisher.intervenorPublisher.sendMessageToAll(
                intervenor.id,
                Unit,
                ActionKind.IntervenorDeleted,
            )
            publisher.intervenorsPublisher.sendMessageToAll(
                findAll(),
                ActionKind.IntervenorsChanged,
            )
            success(true)
        }
    }

    /**
     * Obtém um interveniente pelo número de identificação.
     *
     * @param idNumber Número de identificação.
     *
     * @return [Intervenor] correspondente, ou erro do tipo [IntervenorError].
     */
    fun findByIntervenorByIdNumber(idNumber: String): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByIdNumber(idNumber) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    /**
     * Obtém um interveniente pela informação de contacto.
     *
     * @param contactInfo Informação de contacto.
     *
     * @return [Intervenor] correspondente, ou erro do tipo [IntervenorError].
     */
    fun findByIntervenorContactInfo(contactInfo: String): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findByContactInfo(contactInfo) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    /**
     * Obtém um interveniente pelo identificador.
     *
     * @param id Identificador do interveniente.
     *
     * @return [Intervenor] correspondente, ou erro do tipo [IntervenorError].
     */
    fun findByID(id: Int): Either<IntervenorError, Intervenor> {
        return trxManager.run {
            val intervenor = repoIntervenor.findById(id) ?: return@run failure(IntervenorError.IntervenorNotFound)
            success(intervenor)
        }
    }

    /**
     * Obtém todos os intervenientes registados no sistema.
     *
     * @return Lista de todas as [Intervenor], ou erro do tipo [IntervenorError].
     */
    fun findAll(): List<Intervenor> = trxManager.run {repoIntervenor.findAll() }
}
