// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS METHOD to your existing LogbookRepository.java (the JPA interface)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finds all logbooks where the student's assigned university supervisor
 * matches the given supervisor user.
 *
 * This relies on the `university_supervisor_id` column in the users table
 * (set by the admin when assigning supervisors to students).
 */
List<Logbook> findByStudentUniversitySupervisor(User supervisor);
