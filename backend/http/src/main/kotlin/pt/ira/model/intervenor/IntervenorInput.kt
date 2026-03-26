package pt.ira.model.intervenor

data class IntervenorInput(
    val idNumber: String,
    val idType: String,
    val name: String,
    val contactInfo: String,
    val address: String,
)
