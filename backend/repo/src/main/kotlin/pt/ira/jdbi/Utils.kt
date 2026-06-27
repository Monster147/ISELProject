package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import pt.ira.jdbi.mapper.IntListMapper
import pt.ira.jdbi.mapper.PasswordValidationInfoMapper
import pt.ira.jdbi.mapper.TokenValidationInfoMapper
import pt.ira.token.TokenValidationInfo
import pt.ira.user.PasswordValidationInfo

/**
 * Configura uma instância de [Jdbi] com os plugins e mappers necessários para a aplicação.
 *
 * Instala o suporte a tipos Kotlin, o plugin PostgreSQL e regista os mappers
 * de colunas personalizados para [PasswordValidationInfo], [TokenValidationInfo]
 * e listas de inteiros.
 *
 * @receiver Instância de [Jdbi] a configurar.
 * @return A mesma instância de [Jdbi] após configuração (para encadeamento).
 */
fun Jdbi.configureWithAppRequirements(): Jdbi {
    installPlugin(KotlinPlugin())
    installPlugin(PostgresPlugin())
    registerColumnMapper(PasswordValidationInfo::class.java, PasswordValidationInfoMapper())
    registerColumnMapper(TokenValidationInfo::class.java, TokenValidationInfoMapper())
    registerColumnMapper(IntListMapper())

    return this
}
