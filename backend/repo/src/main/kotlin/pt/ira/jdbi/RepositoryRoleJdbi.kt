package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.interfaces.RepositoryRole
import pt.ira.role.Role
import java.sql.ResultSet

class RepositoryRoleJdbi(
    private val handle: Handle,
) : RepositoryRole {
    override fun createRole(name: String): Role {
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.roles (name)
                VALUES (:name)
                RETURNING id
                """.trimIndent(),
            ).bind("name", name)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Role(id, name)
    }

    override fun deleteRoleByName(name: String) {
        handle.createUpdate("DELETE FROM dbo.roles WHERE name = :name")
            .bind("name", name)
            .execute()
    }

    override fun findByName(name: String): Role? =
        handle.createQuery(
            """
            SELECT id, name 
            FROM dbo.roles 
            WHERE name = :name
            """.trimIndent(),
        ).bind("name", name)
            .map { rs, _ -> mapRowToRole(rs) }
            .singleOrNull()

    override fun findById(id: Int): Role? =
        handle.createQuery(
            """
            SELECT id, name 
            FROM dbo.roles 
            WHERE id = :id
            """.trimIndent(),
        ).bind("id", id)
            .map { rs, _ -> mapRowToRole(rs) }
            .singleOrNull()

    override fun findAll(): List<Role> =
        handle.createQuery(
            """
            SELECT id ,name
            FROM dbo.roles
            ORDER BY id
            """.trimIndent(),
        ).map { rs, _ -> mapRowToRole(rs) }
            .list()

    override fun save(entity: Role) {
        handle.createUpdate(
            """
            UPDATE dbo.roles
            SET name=:displayName
            WHERE id=:id
            """.trimIndent(),
        ).bind("id", entity.id)
            .bind("displayName", entity.displayName)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.roles WHERE id = :role_id").bind("role_id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.roles")
            .execute()
    }

    private fun mapRowToRole(rs: ResultSet): Role {
        val id = rs.getInt("id")
        val displayName = rs.getString("name")

        return Role(id, displayName)
    }
}
