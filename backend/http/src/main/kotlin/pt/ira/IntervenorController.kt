package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pt.ira.intervenor.Intervenor
import pt.ira.model.Problem
import pt.ira.model.intervenor.IntervenorInput
import pt.ira.model.intervenor.IntervenorUpdateInput

@RestController
@RequestMapping("/api/intervenor")
class IntervenorController(
    private val intervenorService: IntervenorService,
) {
    @PostMapping
    fun createIntervenor(
        @RequestBody intervenorInput: IntervenorInput,
    ): ResponseEntity<*> {
        val result: Either<IntervenorError, Intervenor> =
            intervenorService.createIntervenor(
                idNumber = intervenorInput.idNumber,
                idType = intervenorInput.idType,
                name = intervenorInput.name,
                contactInfo = intervenorInput.contactInfo,
                address = intervenorInput.address,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/intervenor/${result.value.id}",
                    ).build<Unit>()

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorAlreadyExists ->
                        Problem.IntervenorAlreadyExists.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/update/{intervenorId}")
    fun updateIntervenor(
        @RequestBody intervenorUpdateInput: IntervenorUpdateInput,
        @PathVariable intervenorId: Int,
    ): ResponseEntity<*> {
        val result =
            intervenorService.updateIntervenor(
                intervenorId = intervenorId,
                idNumber = intervenorUpdateInput.idNumber,
                idType = intervenorUpdateInput.idType,
                name = intervenorUpdateInput.name,
                contactInfo = intervenorUpdateInput.contactInfo,
                address = intervenorUpdateInput.address,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(
                        "Location",
                        "/api/intervenor/${result.value.id}",
                    ).body(
                        result.value,
                    )

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorNotFound ->
                        Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @DeleteMapping("/delete/byIdNumber/{idNumber}")
    fun deleteIntervenorByIdNumber(
        @PathVariable idNumber: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.deleteIntervenorByIdNumber(
                idNumber = idNumber,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Any>()

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorNotFound ->
                        Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/byIdNumber/{idNumber}")
    fun findIntervenorByIdNumber(
        @PathVariable idNumber: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.findByIntervenorByIdNumber(
                idNumber = idNumber,
            )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorNotFound ->
                        Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/byContactInfo/{contactInfo}")
    fun findIntervenorByContactInfo(
        @PathVariable contactInfo: String,
    ): ResponseEntity<*> {
        val result =
            intervenorService.findByIntervenorContactInfo(
                contactInfo = contactInfo,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorNotFound ->
                        Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }
    @GetMapping("/{id}")
    fun findIntervenorByContactInfo(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = intervenorService.findByID(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is IntervenorError.IntervenorNotFound ->
                        Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

}
