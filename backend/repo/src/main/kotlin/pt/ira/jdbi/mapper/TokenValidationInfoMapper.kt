package pt.ira.jdbi.mapper

import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import pt.ira.token.TokenValidationInfo
import java.sql.ResultSet
import java.sql.SQLException

/**
 * Mapper JDBI para colunas do tipo [TokenValidationInfo].
 *
 * Converte o valor textual armazenado na base de dados (hash do token)
 * para uma instância tipificada de [TokenValidationInfo].
 */
class TokenValidationInfoMapper : ColumnMapper<TokenValidationInfo> {
    @Throws(SQLException::class)
    override fun map(
        r: ResultSet,
        columnNumber: Int,
        ctx: StatementContext?,
    ): TokenValidationInfo = TokenValidationInfo(r.getString(columnNumber))
}
