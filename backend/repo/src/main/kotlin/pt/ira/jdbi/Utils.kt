package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.KotlinPlugin
import org.jdbi.v3.core.mapper.reflect.ConstructorMapper
import org.jdbi.v3.postgres.PostgresPlugin
import pt.ira.Evidence
import pt.ira.Intervenor
import pt.ira.TokenValidationInfo
import pt.ira.PasswordValidationInfo
import pt.ira.Report
import pt.ira.User
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