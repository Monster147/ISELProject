plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.1"
    id("org.springframework.boot") version "3.5.6"
    id("io.spring.dependency-management") version "1.1.7"
}

repositories {
    mavenCentral()
}

dependencies {
    api(project(":backend:domain"))
    implementation("org.springframework:spring-webmvc:6.2.11")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // To use Servlet API
    implementation("jakarta.servlet:jakarta.servlet-api:6.1.0")

    // To get password encode
    api("org.springframework.security:spring-security-core:6.5.5")

    implementation("org.jdbi:jdbi3-core:3.37.1")
    implementation("org.jdbi:jdbi3-kotlin:3.37.1")
    implementation("org.jdbi:jdbi3-postgres:3.37.1")
    implementation("org.postgresql:postgresql:42.7.2")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    testImplementation("org.springframework:spring-test:6.2.11")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    implementation("io.github.cdimascio:dotenv-kotlin:6.5.1")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor:1.7.3")
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(21)
}

tasks.test {
    useJUnitPlatform()
}

val composeFileDir: Directory = rootProject.layout.projectDirectory
val dockerComposePath = composeFileDir.file("backend/repo/docker-compose.yml").toString()
val dockerExe =
    when (
        org.gradle.internal.os.OperatingSystem
            .current()
    ) {
        org.gradle.internal.os.OperatingSystem.MAC_OS -> "/usr/local/bin/docker"
        org.gradle.internal.os.OperatingSystem.WINDOWS -> "docker"
        else -> "docker" // Linux and others
    }

tasks.register<Exec>("dbTestsUp") {
    commandLine(dockerExe, "compose", "-f", dockerComposePath, "up", "-d", "--build", "--force-recreate", "db-tests")
}

tasks.register<Exec>("dbTestsWait") {
    commandLine(dockerExe, "exec", "db-tests", "/app/bin/wait-for-postgres.sh", "localhost")
    dependsOn("dbTestsUp")
}

tasks.register<Exec>("dbTestsDown") {
    commandLine(dockerExe, "compose", "-f", dockerComposePath, "down", "db-tests")
}
