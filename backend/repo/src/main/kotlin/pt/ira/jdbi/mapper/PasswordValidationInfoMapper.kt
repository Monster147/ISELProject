package pt.ira.jdbi.mapper

import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import pt.ira.user.PasswordValidationInfo
import java.sql.ResultSet
import java.sql.SQLException

/**
 * Mapper JDBI para colunas do tipo [PasswordValidationInfo].
 *
 * Converte o valor textual armazenado na base de dados (hash da palavra-passe)
 * para uma instância tipificada de [PasswordValidationInfo].
 */
class PasswordValidationInfoMapper : ColumnMapper<PasswordValidationInfo> {
    @Throws(SQLException::class)
    override fun map(
        r: ResultSet,
        columnNumber: Int,
        ctx: StatementContext?,
    ): PasswordValidationInfo = PasswordValidationInfo(r.getString(columnNumber))
}
