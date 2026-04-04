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
import pt.ira.model.role.RoleInput
import pt.ira.model.role.RolesInput
import pt.ira.model.user.UserCreateTokenInputModel
import pt.ira.model.user.UserCreateTokenOutputModel
import pt.ira.model.user.UserHomeOutputModel
import pt.ira.model.user.UserInput
import pt.ira.report.ReportTypePercentage
import pt.ira.user.AuthenticatedUser
import pt.ira.user.User

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService,
) {
    @PostMapping
    fun createUser(
        @RequestBody userInput: UserInput,
    ): ResponseEntity<*> {
        val result: Either<UserError, User> =
            userService.createUser(
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
                        "/api/user/${result.value.id}",
                    ).build<Unit>()

            is Failure ->
                when (result.value) {
                    is UserError.AlreadyUsedEmailAddress ->
                        Problem.EmailAlreadyInUse.response(
                            HttpStatus.BAD_REQUEST,
                        )

                    is UserError.InsecurePassword ->
                        Problem.InsecurePassword.response(
                            HttpStatus.BAD_REQUEST,
                        )

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/token")
    fun token(
        @RequestBody tokenInput: UserCreateTokenInputModel,
    ): ResponseEntity<*> {
        val result =
            userService.createToken(
                tokenInput.email,
                tokenInput.password,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(UserCreateTokenOutputModel(result.value.tokenValue))

            is Failure ->
                when (result.value) {
                    TokenCreationError.UserOrPasswordAreInvalid ->
                        Problem.UserOrPasswordAreInvalid.response(HttpStatus.BAD_REQUEST)
                }
        }
    }

    @PostMapping("/logout")
    fun logout(user: AuthenticatedUser) {
        userService.revokeToken(user.token)
    }

    @GetMapping("me")
    fun userHome(userAuthenticatedUser: AuthenticatedUser): ResponseEntity<UserHomeOutputModel> =
        ResponseEntity
            .status(HttpStatus.OK)
            .body(
                UserHomeOutputModel(
                    userAuthenticatedUser.user.id,
                    userAuthenticatedUser.user.name,
                    userAuthenticatedUser.user.email,
                    userAuthenticatedUser.user.roles,
                ),
            )

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
                            result.value.email,
                            result.value.roles,
                        ),
                    )

            is Failure ->
                when (result.value) {
                    is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/roles/add")
    fun addRole(
        user: AuthenticatedUser,
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result =
            userService.addRole(
                adminId = user.user.id,
                userId = roleInput.userId,
                roleId = roleInput.roleId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role added successfully")

            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotAdmin -> Problem.UserNotAdmin.response(HttpStatus.FORBIDDEN)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/roles/remove")
    fun removeRole(
        user: AuthenticatedUser,
        @RequestBody roleInput: RoleInput,
    ): ResponseEntity<*> {
        val result =
            userService.removeRole(
                adminId = user.user.id,
                userId = roleInput.userId,
                roleId = roleInput.roleId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Role removed successfully")

            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotAdmin -> Problem.UserNotAdmin.response(HttpStatus.FORBIDDEN)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/roles/set")
    fun setRoles(
        user: AuthenticatedUser,
        @RequestBody rolesInput: RolesInput,
    ): ResponseEntity<*> {
        val result =
            userService.setRole(
                adminId = user.user.id,
                userId = rolesInput.userId,
                roleIdList = rolesInput.rolesIds,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body("Roles setted successfully")

            is Failure ->
                when (result.value) {
                    is UserError.RoleDoesntExist -> Problem.RoleNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    is UserError.UserNotAdmin -> Problem.UserNotAdmin.response(HttpStatus.FORBIDDEN)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/find/role/{roleId}")
    fun findUsersByRole(
        @PathVariable roleId: Int,
    ): ResponseEntity<*> {
        val result = userService.findUsersByRoles(roleId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(
                        result.value.map { user ->
                            UserHomeOutputModel(
                                user.id,
                                user.name,
                                user.email,
                                user.roles,
                            )
                        },
                    )

            is Failure ->
                when (result.value) {
                    is UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/percentages/{userId}")
    fun getPercentages(
        @PathVariable userId: Int,
    ): ResponseEntity<List<ReportTypePercentage>> = ResponseEntity.ok(userService.getTypePercentagesByReporter(userId))

    /*private fun handleUserErrors(errors: UserError): ResponseEntity<*> =
        when(error) {
            UserError.AlreadyUsedEmailAddress ->
            UserError.InsecurePassword ->
            UserError.UserNotFound ->
        }*/
}
