package pt.ira.emitters

/**
 * Emissor para sinais de dados atualizados.
 *
 * Implementações devem notificar observadores quando houver alterações relevantes
 * nos dados, permitir registar um callback para conclusão e outro para erros.
 *
 */
interface UpdatedDataEmitter {
    /**
     * Emite um sinal com os dados atualizados para os ouvintes/subscritores.
     * @param signal - instância de `UpdatedData` contendo a informação a propagar.
     */
    fun emit(signal: UpdatedData)

    /**
     * Regista um callback a executar quando o fluxo de emissões for concluído.
     * @param callback - função sem argumentos chamada na conclusão.
     */
    fun onCompletion(callback: () -> Unit)

    /**
     * Regista um callback a executar em caso de erro durante a emissão.
     * @param callback - função que recebe o `Throwable` ocorrido.
     */
    fun onError(callback: (Throwable) -> Unit)
}