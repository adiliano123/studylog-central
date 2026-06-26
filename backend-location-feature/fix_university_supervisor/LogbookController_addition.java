// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS METHOD to your existing LogbookController.java
//
// This endpoint always returns only the logbooks whose students have THIS
// supervisor assigned as their university supervisor, regardless of whether
// supervisorType is set in the database.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/logbooks/assigned-to-me
 *
 * Returns logbooks where the logged-in university supervisor is assigned
 * as the student's universitySupervisor. This guarantees each supervisor
 * only sees their own students — no dependency on supervisorType being set.
 */
@GetMapping("/assigned-to-me")
@PreAuthorize("hasRole('ROLE_SUPERVISOR')")
public ResponseEntity<?> getAssignedLogbooks(Authentication authentication) {
    try {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User supervisor = userService.getUserByEmail(email);

        // Use the existing repository method that queries by universitySupervisor
        List<Logbook> logbooks = logbookService.getLogbooksByUniversitySupervisor(supervisor);

        System.out.println("=== GET /api/logbooks/assigned-to-me ===");
        System.out.println("Supervisor: " + supervisor.getFirstName() + " " + supervisor.getLastName());
        System.out.println("Found " + logbooks.size() + " logbooks");

        return ResponseEntity.ok(logbooks);
    } catch (Exception e) {
        System.err.println("Error fetching assigned logbooks: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching logbooks: " + e.getMessage());
    }
}
