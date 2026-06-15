package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.interfaces.RepositoryIntervenor
import pt.ira.intervenor.Intervenor
import java.sql.ResultSet

class RepositoryIntervenorJdbi(
    private val handle: Handle,
) : RepositoryIntervenor {
    private companion object {
        const val INTERVENOR_COLUMNS = """id, idNumber, id_type, name, contact_info, address"""
    }

    override fun createIntervenor(
        idNumber: String,
        idType: String,
        name: String,
        contactInfo: String,
        address: String,
    ): Intervenor {
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.intervenor (idNumber, id_type, name, contact_info, address) 
                VALUES (:idNumber, :idType, :name, :contactInfo, :address)
                RETURNING id
                """.trimIndent(),
            )
                .bind("idNumber", idNumber)
                .bind("idType", idType)
                .bind("name", name)
                .bind("contactInfo", contactInfo)
                .bind("address", address)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Intervenor(
            id = id,
            idNumber = idNumber,
            idType = idType,
            name = name,
            contactInfo = contactInfo,
            address = address,
        )
    }

    override fun updateIntervenor(
        intervenor: Intervenor,
        idNumber: String?,
        idType: String?,
        name: String?,
        contactInfo: String?,
        address: String?,
    ): Intervenor {
        val updatedIntervenor =
            intervenor.copy(
                idNumber = idNumber ?: intervenor.idNumber,
                idType = idType ?: intervenor.idType,
                name = name ?: intervenor.name,
                contactInfo = contactInfo ?: intervenor.contactInfo,
                address = address ?: intervenor.address,
            )
        save(updatedIntervenor)
        return updatedIntervenor
    }

    override fun findByIdNumber(idNumber: String): Intervenor? =
        handle.createQuery(
            """
            SELECT $INTERVENOR_COLUMNS
            FROM dbo.intervenor
            WHERE idNumber = :idNumber
            """.trimIndent(),
        )
            .bind("idNumber", idNumber)
            .map { rs, _ -> mapRowToIntervenor(rs) }
            .singleOrNull()

    override fun findByContactInfo(contactInfo: String): Intervenor? =
        handle.createQuery(
            """
            SELECT $INTERVENOR_COLUMNS
            FROM dbo.intervenor
            WHERE contact_info = :contact_info
            """.trimIndent(),
        )
            .bind("contact_info", contactInfo)
            .map { rs, _ -> mapRowToIntervenor(rs) }
            .singleOrNull()

    override fun findById(id: Int): Intervenor? =
        handle.createQuery(
            """
            SELECT $INTERVENOR_COLUMNS
            FROM dbo.intervenor
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToIntervenor(rs) }
            .singleOrNull()

    override fun findAll(): List<Intervenor> =
        handle.createQuery(
            """
            SELECT $INTERVENOR_COLUMNS
            FROM dbo.intervenor
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToIntervenor(rs) }
            .list()

    override fun save(entity: Intervenor) {
        handle.createUpdate(
            """
            UPDATE dbo.intervenor
            SET idNumber = :idNumber,
                id_type = :idType,
                name = :name,
                contact_info = :contactInfo,
                address = :address
            WHERE id = :id
            """.trimIndent(),
        )
            .bindBean(entity)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.intervenor where id=:id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.intervenor").execute()
    }

    private fun mapRowToIntervenor(rs: ResultSet): Intervenor =
        Intervenor(
            id = rs.getInt("id"),
            idNumber = rs.getString("idNumber"),
            idType = rs.getString("id_type"),
            name = rs.getString("name"),
            contactInfo = rs.getString("contact_info"),
            address = rs.getString("address"),
        )
}
