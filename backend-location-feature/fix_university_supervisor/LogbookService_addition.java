// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS METHOD to your existing LogbookService.java
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all logbooks for students who have the given user set as their
 * universitySupervisor. Works independently of the supervisorType field.
 */
public List<Logbook> getLogbooksByUniversitySupervisor(User supervisor) {
    return logbookRepository.findByStudentUniversitySupervisor(supervisor);
}
