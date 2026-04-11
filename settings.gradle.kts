plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}
rootProject.name = "2025-projetoFinal"

include("frontend")
include("backend:app")
include("backend:domain")
include("backend:http")
include("backend:repo")
include("backend:service")
include("frontend:movel")