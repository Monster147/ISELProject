package pt.ira

/**
 * Tipo que representa um valor que pode ser um de dois tipos possíveis.
 *
 * Utilizado para modelar operações que podem resultar em sucesso ou falha de forma
 * explícita e tipificada, sem recorrer a exceções. Por convenção, [Left] representa
 * a falha/erro e [Right] representa o sucesso.
 *
 * @param L Tipo do valor em caso de falha (Left).
 * @param R Tipo do valor em caso de sucesso (Right).
 *
 * @see Success
 * @see Failure
 */
sealed class Either<out L, out R> {
    /**
     * Representa o caso de falha ou erro.
     *
     * @property value Valor do erro.
     */
    data class Left<out L>(
        val value: L,
    ) : Either<L, Nothing>()

    /**
     * Representa o caso de sucesso.
     *
     * @property value Valor do resultado bem-sucedido.
     */
    data class Right<out R>(
        val value: R,
    ) : Either<Nothing, R>()
}

/**
 * Cria um [Either.Right] com o valor fornecido, representando sucesso.
 *
 * @param value Valor do resultado.
 * @return [Either.Right] contendo o valor.
 */
fun <R> success(value: R) = Either.Right(value)

/**
 * Cria um [Either.Left] com o erro fornecido, representando falha.
 *
 * @param error Valor do erro.
 * @return [Either.Left] contendo o erro.
 */
fun <L> failure(error: L) = Either.Left(error)

/** Alias para [Either.Right], usado para clareza semântica em contextos de sucesso. */
typealias Success<S> = Either.Right<S>

/** Alias para [Either.Left], usado para clareza semântica em contextos de falha. */
typealias Failure<F> = Either.Left<F>
