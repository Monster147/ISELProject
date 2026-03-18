package pt.ira.interfaces

import pt.ira.Intervenor

interface RepositoryIntervenor : Repository<Intervenor> {
     fun findByIdNumber(idNumber: String): Intervenor?
     fun findByContactInfo(contactInfo: String): Intervenor?
}