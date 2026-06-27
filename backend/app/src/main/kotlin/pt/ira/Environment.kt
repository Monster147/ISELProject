package pt.ira

/**
 * Utilitário de acesso a variáveis de ambiente da aplicação.
 *
 * Centraliza a leitura de configurações sensíveis (como credenciais de base de dados)
 * a partir de variáveis de ambiente do sistema operativo, evitando que estas sejam
 * codificadas diretamente no código-fonte.
 */
object Environment {
    /**
     * Obtém o URL de ligação à base de dados a partir da variável de ambiente [KEY_DB_URL].
     *
     * @return O valor da variável de ambiente `DB_URL`, ou null caso não esteja definida.
     */
    fun getDbUrl() = System.getenv(KEY_DB_URL)

    private const val KEY_DB_URL = "DB_URL"
}
