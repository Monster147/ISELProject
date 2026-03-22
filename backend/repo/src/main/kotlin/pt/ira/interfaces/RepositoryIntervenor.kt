package pt.ira.interfaces

import pt.ira.Intervenor

interface RepositoryIntervenor : Repository<Intervenor> {
     fun createIntervenor(
          idNumber: String,
          idType: String,
          name: String,
          contactInfo: String,
          address: String,
     ): Intervenor
     fun updateIntervenor(
          intervenor: Intervenor,
          idNumber: String?,
          idType: String?,
          name: String?,
          contactInfo: String?,
          address: String?,
     ) : Intervenor
     fun findByIdNumber(idNumber: String): Intervenor?
     fun findByContactInfo(contactInfo: String): Intervenor?

}