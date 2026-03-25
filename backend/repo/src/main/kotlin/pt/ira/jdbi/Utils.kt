package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.postgres.PostgresPlugin
import pt.ira.token.TokenValidationInfo
import pt.ira.user.PasswordValidationInfo
import pt.ira.jdbi.mapper.IntListMapper
import pt.ira.jdbi.mapper.PasswordValidationInfoMapper
import pt.ira.jdbi.mapper.TokenValidationInfoMapper


fun Jdbi.configureWithAppRequirements(): Jdbi {
    installPlugin(KotlinPlugin())
    installPlugin(PostgresPlugin())
    registerColumnMapper(PasswordValidationInfo::class.java, PasswordValidationInfoMapper())
    registerColumnMapper(TokenValidationInfo::class.java, TokenValidationInfoMapper())
    registerColumnMapper(IntListMapper())

    return this
}