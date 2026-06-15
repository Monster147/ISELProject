package pt.ira.intervenor

data class IntervenorUpdateResult(
    val updatedIntervenor: Intervenor,
    val intervenors: List<Intervenor>,
)
