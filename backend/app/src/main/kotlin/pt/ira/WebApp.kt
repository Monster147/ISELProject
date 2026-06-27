package pt.ira

import org.jdbi.v3.core.Jdbi
import org.postgresql.ds.PGSimpleDataSource
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import pt.ira.http.AuthenticatedUserArgumentResolver
import pt.ira.http.AuthenticationInterceptor
import pt.ira.jdbi.TransactionManagerJdbi
import pt.ira.jdbi.configureWithAppRequirements
import pt.ira.token.Sha256TokenEncoder
import pt.ira.user.UsersDomainConfig
import java.time.Clock
import java.time.Duration

/**
 * Configurador do pipeline HTTP do Spring MVC.
 *
 * Regista o interceptor de autenticação e o resolver de argumentos de utilizadores
 * autenticados, integrando-os no ciclo de vida do dispatcher servlet.
 *
 * @param authenticationInterceptor Interceptor responsável por validar tokens antes
 *                                  de encaminhar pedidos para os controllers.
 * @param authenticatedUserArgumentResolver Resolver que injeta o utilizador autenticado
 *                                          como argumento nos métodos dos controllers.
 */
@Configuration
class PipelineConfigurer(
    val authenticationInterceptor: AuthenticationInterceptor,
    val authenticatedUserArgumentResolver: AuthenticatedUserArgumentResolver,
) : WebMvcConfigurer {
    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(authenticationInterceptor)
    }

    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(authenticatedUserArgumentResolver)
    }
}

/**
 * Classe principal da aplicação Spring Boot.
 *
 * Define e expõe os beans de infraestrutura necessários para o funcionamento
 * da aplicação, incluindo a ligação à base de dados, codificação de palavras-passe,
 * gestão de tokens e configuração de domínio.
 */
@SpringBootApplication(scanBasePackages = ["pt.ira"])
class WebApp {
    /**
     * Cria e configura a instância de [Jdbi] para acesso à base de dados PostgreSQL.
     *
     * A URL de ligação é obtida a partir da variável de ambiente `DB_URL`.
     *
     * @return Instância de [Jdbi] configurada com os requisitos da aplicação.
     */
    @Bean
    fun jdbi() =
        Jdbi
            .create(
                PGSimpleDataSource().apply {
                    setURL(Environment.getDbUrl())
                },
            ).configureWithAppRequirements()

    /**
     * Cria o codificador de palavras-passe usando o algoritmo BCrypt.
     *
     * @return Instância de [BCryptPasswordEncoder].
     */
    @Bean
    fun passwordEncoder() = BCryptPasswordEncoder()

    /**
     * Cria o codificador de tokens usando SHA-256.
     *
     * @return Instância de [Sha256TokenEncoder].
     */
    @Bean
    fun tokenEncoder() = Sha256TokenEncoder()

    /**
     * Cria o relógio do sistema em UTC, utilizado para validação temporal de tokens.
     *
     * @return Instância de [Clock] com fuso horário UTC.
     */
    @Bean
    fun clock(): Clock = Clock.systemUTC()

    /**
     * Cria o gestor de transações JDBI, responsável por gerir o ciclo de vida
     * das transações na base de dados.
     *
     * @param jdbi Instância de [Jdbi] injetada pelo Spring.
     * @return Instância de [TransactionManagerJdbi].
     */
    @Bean
    fun trxManagerJdbi(jdbi: Jdbi): TransactionManagerJdbi = TransactionManagerJdbi(jdbi)

    /*@Bean
    fun trxManager(): TransactionManagerInMem = TransactionManagerInMem()*/

    /**
     * Cria a configuração de domínio de utilizadores com as políticas de segurança
     * e gestão de tokens da aplicação.
     *
     * @return Instância de [UsersDomainConfig] com os parâmetros definidos.
     */
    @Bean
    fun usersDomainConfig() =
        UsersDomainConfig(
            tokenSizeInBytes = 256 / 8,
            tokenTtl = Duration.ofHours(24),
            tokenRollingTtl = Duration.ofHours(1),
            maxTokensPerUser = 3,
        )
}

/**
 * Ponto de entrada da aplicação.
 *
 * Inicializa o contexto Spring Boot e arranca o servidor HTTP.
 */
fun main() {
    runApplication<WebApp>()
}
