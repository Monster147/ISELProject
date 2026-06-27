package pt.ira.jdbi.mapper

import org.jdbi.v3.core.mapper.ColumnMapper
import org.jdbi.v3.core.statement.StatementContext
import java.sql.ResultSet
import java.sql.SQLException

/**
 * Mapper JDBI para colunas do tipo array de inteiros (PostgreSQL `integer[]`).
 *
 * Converte arrays SQL para listas de inteiros Kotlin, utilizados por exemplo
 * para colunas que armazenam conjuntos de identificadores (roles, intervenors, evidences).
 */
class IntListMapper : ColumnMapper<List<Int>> {
    @Throws(SQLException::class)
    override fun map(
        rs: ResultSet,
        columnNumber: Int,
        ctx: StatementContext?,
    ): List<Int> {
        val sqlArray = rs.getArray(columnNumber) ?: return emptyList()
        val javaArray = sqlArray.array as Array<*>
        return javaArray.map { (it as Number).toInt() }
    }
}
