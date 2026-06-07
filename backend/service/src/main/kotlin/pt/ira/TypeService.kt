package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.type.Type

/**
 * Hierarquia de erros específicos do domínio dos tipos.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com tipos,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see TypeService
 */
sealed class TypeError {
    /**
     * O tipo solicitado não foi encontrado no sistema,
     * quer por identificador, quer por nome.
     */
    data object TypeNotFound : TypeError()

    /**
     * Um tipo com o nome especificado já existe no sistema.
     */
    data object TypeAlreadyExists : TypeError()

    /**
     * O nome fornecido para o tipo é inválido
     */
    data object InvalidName : TypeError()
}

/**
 * Serviço responsável pela gestão dos tipos.
 *
 * Responsabilidades:
 * - criação e validação de tipos;
 * - consulta de tipos;
 * - prevenção de duplicados por nome.
 *
 * @param trxManager gestor de transações para acesso aos repositórios.
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class TypeService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers,
) {
    /**
     * Cria um tipo.
     *
     * Valida:
     * - nome não vazio;
     * - inexistência de outro tipo com o mesmo nome.
     *
     * @param name Nome do tipo.
     * @param form Estrutura do formulário em JSON.
     *
     * @return [Type] criado, ou erro [TypeError].
     */
    fun createType(
        name: String,
        form: JsonNode,
    ): Either<TypeError, Type> {
        return trxManager.run {
            if (name.isBlank()) return@run failure(TypeError.InvalidName)

            repoType.findByName(name)?.let {
                return@run failure(TypeError.TypeAlreadyExists)
            }

            val type = repoType.createType(name, form)
            publisher.typesPublisher.sendMessageToAll(
                findAll(),
                ActionKind.TypesChanged,
            )
            success(type)
        }
    }

    /**
     * Obtém um tipo pelo identificador.
     *
     * @param id Identificador do tipo.
     *
     * @return [Type], ou erro [TypeError.TypeNotFound].
     */
    fun findById(id: Int): Either<TypeError, Type> {
        return trxManager.run {
            val type =
                repoType.findById(id)
                    ?: return@run failure(TypeError.TypeNotFound)

            success(type)
        }
    }

    /**
     * Obtém um tipo pelo nome.
     *
     * @param name Nome do tipo.
     *
     * @return [Type], ou erro [TypeError.TypeNotFound].
     */
    fun findByName(name: String): Either<TypeError, Type> {
        return trxManager.run {
            val type =
                repoType.findByName(name)
                    ?: return@run failure(TypeError.TypeNotFound)

            success(type)
        }
    }

    /**
     * Obtém todos os tipos.
     *
     * @return Lista de [Type].
     */
    fun findAll(): List<Type> =
        trxManager.run {
            repoType.findAll()
        }

    /**
     * Atualiza um tipo existente.
     *
     * Apenas valida existência — assumes que o `form` já vem válido.
     *
     * @param id Identificador do tipo.
     * @param name Novo nome (opcional).
     * @param form Novo form (opcional).
     *
     * @return [Type] atualizado, ou erro [TypeError].
     */
    fun updateType(
        id: Int,
        name: String?,
        form: JsonNode?,
    ): Either<TypeError, Type> {
        return trxManager.run {
            val existing =
                repoType.findById(id)
                    ?: return@run failure(TypeError.TypeNotFound)

            val updated =
                existing.copy(
                    name = name ?: existing.name,
                    form = form ?: existing.form,
                )

            repoType.save(updated)
            publisher.typesPublisher.sendMessageToAll(
                findAll(),
                ActionKind.TypesChanged,
            )
            success(updated)
        }
    }

    /**
     * Remove um tipo.
     *
     * @param id Identificador do tipo.
     *
     * @return true se removido, ou erro [TypeError].
     */
    fun deleteById(id: Int): Either<TypeError, Boolean> {
        return trxManager.run {
            repoType.findById(id)
                ?: return@run failure(TypeError.TypeNotFound)

            repoType.deleteById(id)
            publisher.typesPublisher.sendMessageToAll(
                findAll(),
                ActionKind.TypesChanged,
            )
            success(true)
        }
    }
}
