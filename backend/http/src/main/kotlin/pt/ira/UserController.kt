package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pt.ira.model.Problem
import pt.ira.model.RoleInput
import pt.ira.model.RolesInput
import pt.ira.model.UserCreateTokenInputModel
import pt.ira.model.UserCreateTokenOutputModel
import pt.ira.model.UserHomeOutputModel
import pt.ira.model.UserInput

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService,
) {
    @PostMapping
    fun createUser(
        @RequestBody userInput: UserInput
    ): ResponseEntity<*> {
        val result: Either<UserError, User> = userService.createUser(
            name = userInput.name,
            email = userInput.email,
            password = userInput.password,
        )

        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/user/${result.value.id}"
                    ).build<Unit>()

            is Failure ->
                when (result.value) {
                    is UserError.AlreadyUsedEmailAddress ->
                        ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .header("Content-Type", "application/problem+json")
                            .body(Unit)
                    // Problem.EmailAlreadyInUse.response( HttpStatus.BAD_REQUEST, )
                    is UserError.InsecurePassword ->
                        ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .header("Content-Type", "application/problem+json")
                            .body(Unit)
                    // Problem.InsecurePassword.response( HttpStatus.BAD_REQUEST, )
                    else -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.InternalServerError.response( HttpStatus.INTERNAL_SERVER_ERROR, )
                }
        }
    }

    @PostMapping("/token")
    fun token(
        @RequestBody tokenInput: UserCreateTokenInputModel
    ): ResponseEntity<*> {
        val result = userService.createToken(
            tokenInput.email,
            tokenInput.password,
        )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(UserCreateTokenOutputModel(result.value.tokenValue))
            is Failure ->
                when(result.value) {
                    TokenCreationError.UserOrPasswordAreInvalid ->
                        ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .header("Content-Type", "application/problem+json")
                            .body(Unit)
                    // Problem.UserOrPasswordAreInvalid.response( HttpStatus.BAD_REQUEST, )
                }
        }
    }

    @PostMapping("/logout")
    fun logout(user: AuthenticatedUser) {
        userService.revokeToken(user.token)
    }

    @GetMapping("/{userId}")
    fun findUserById(
        @PathVariable("userId") userId: Int,
    ): ResponseEntity<*> {
        val result = userService.findUserById(userId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(
                        UserHomeOutputModel(
                            result.value.id,
                            result.value.name,
                            result.value.email
                        )
                    )
            is Failure ->
                when (result.value){
                    is UserError.UserNotFound -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.UserNotFound.response( HttpStatus.NOT_FOUND, )
                    else -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.InternalServerError.response( HttpStatus.INTERNAL_SERVER_ERROR, )
                }
        }
    }

    @PostMapping("/roles/add")
    fun addRole(
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result = userService.addRole(
            userId = roleInput.userId,
            roleId = roleInput.roleId,
        )
        return when(result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role added successfully")
            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.RoleDoesntExist.response( HttpStatus.BAD_REQUEST, )
                    is UserError.UserNotFound -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.UserNotFound.response( HttpStatus.NOT_FOUND, )
                     else -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.InternalServerError.response( HttpStatus.INTERNAL_SERVER_ERROR, )
                }
        }
    }

    @PostMapping("/roles/remove")
    fun removeRole(
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result = userService.removeRole(
            userId = roleInput.userId,
            roleId = roleInput.roleId,
        )
        return when(result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role removed successfully")
            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.RoleDoesntExist.response( HttpStatus.BAD_REQUEST, )
                    is UserError.UserNotFound -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.UserNotFound.response( HttpStatus.NOT_FOUND, )
                    else -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.InternalServerError.response( HttpStatus.INTERNAL_SERVER_ERROR, )
                }
        }
    }

    @PostMapping("/roles/remove")
    fun setRoles(
        @RequestBody rolesInput: RolesInput,
    ): ResponseEntity<*> {
        val result = userService.setRole(
            userId = rolesInput.userId,
            roleIdList = rolesInput.rolesIds,
        )
        return when(result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Roles setted successfully")
            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.RoleDoesntExist.response( HttpStatus.BAD_REQUEST, )
                    is UserError.UserNotFound -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.UserNotFound.response( HttpStatus.NOT_FOUND, )
                    else -> ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .header("Content-Type", "application/problem+json")
                        .body(Unit)
                    // Problem.InternalServerError.response( HttpStatus.INTERNAL_SERVER_ERROR, )
                }
        }
    }

    @GetMapping("/by-role/{roleId}")
    fun findUsersByRole(
        @PathVariable("roleId") roleId: Int,
    ): ResponseEntity<*> {
        val result = userService.findUsersByRoles(roleId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value.map { user ->
                        UserHomeOutputModel(
                            user.id,
                            user.name,
                            user.email
                        )
                    })

            is Failure ->
                when (result.value) {
                    is UserError.UserNotFound ->
                        ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .header("Content-Type", "application/problem+json")
                            .body(Unit)

                    else ->
                        ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .header("Content-Type", "application/problem+json")
                            .body(Unit)
                }
        }
    }

    /*private fun handleUserErrors(errors: UserError): ResponseEntity<*> =
        when(error) {
            UserError.AlreadyUsedEmailAddress ->
            UserError.InsecurePassword ->
            UserError.UserNotFound ->
        }*/
}