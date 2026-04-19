package pt.ira.publishers

import jakarta.inject.Named

@Named
class Publishers {
    val evidencePublisher = ClassPublisher()
    val intervenorPublisher = ClassPublisher()
    val intervenorsPublisher = ClassesPublisher()
    val occurrencePublisher = ClassPublisher()
    val occurrencesPublisher = ClassPublisher()
    val reportPublisher = ClassPublisher()
    val documentsPublisher = ClassesPublisher()
    val typesPublisher = ClassesPublisher()
}
