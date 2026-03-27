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
import pt.ira.model.Problem

@RestController
@RequestMapping("/api/role")
class RoleController(
    private val roleService: RoleService,
) {
    @PostMapping
    fun createRole(
        @RequestBody roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.createRole(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(201)
                    .header(
                        "Location",
                        "/api/role/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    is RoleError.RoleAlreadyExists ->
                        Problem.RoleAlreadyExists.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @DeleteMapping("/{roleName}")
    fun delete(
        @PathVariable roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.deleteRoleByName(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Unit>()
            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/byName/{roleName}")
    fun findByName(
        @PathVariable roleName: String,
    ): ResponseEntity<*> {
        val result = roleService.findByName(roleName)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/byId/{id}")
    fun findById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = roleService.findById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is RoleError.RoleNotFound ->
                        Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping
    fun findAll(): ResponseEntity<*> {
        val result = roleService.findAllRoles()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }
}
