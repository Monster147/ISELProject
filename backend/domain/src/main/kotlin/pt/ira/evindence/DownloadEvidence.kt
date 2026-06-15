package pt.ira.evindence

import org.springframework.core.io.Resource

data class DownloadEvidence(
    val evidence: Evidence,
    val resource: Resource,
)
