package com.example.logbook.repository;

import com.example.logbook.model.Location;
import com.example.logbook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    /** All locations for a student, newest first */
    List<Location> findByStudentOrderByCapturedAtDesc(User student);

    /** Most recent location for a student */
    Optional<Location> findTopByStudentOrderByCapturedAtDesc(User student);

    /** Most recent location for each student (used by admin/supervisor overview) */
    @Query("""
        SELECT l FROM Location l
        WHERE l.capturedAt = (
            SELECT MAX(l2.capturedAt)
            FROM Location l2
            WHERE l2.student = l.student
        )
        ORDER BY l.capturedAt DESC
    """)
    List<Location> findLatestLocationPerStudent();
}
