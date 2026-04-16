package pt.ira.publishers

import jakarta.inject.Named

@Named
class Publishers {
    val evidencePublisher = ClassPublisher()
    val intervenorPublisher = ClassPublisher()
    val intervenorsPublisher = ClassesPublisher()
    val occurrencePublisher = ClassPublisher()
    val occurrencesPublisher = ClassesPublisher()
    val reportPublisher = ClassPublisher()
}
