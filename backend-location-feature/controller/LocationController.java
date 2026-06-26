package com.example.logbook.controller;

import com.example.logbook.dto.LocationRequest;
import com.example.logbook.model.Location;
import com.example.logbook.model.User;
import com.example.logbook.service.LocationService;
import com.example.logbook.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    private final UserService userService;

    @Autowired
    public LocationController(LocationService locationService, UserService userService) {
        this.locationService = locationService;
        this.userService = userService;
    }

    // ─── Student endpoints ────────────────────────────────────────────────────

    /**
     * POST /api/locations
     * Save the student's current location (called automatically by the map component).
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<?> saveLocation(
            @RequestBody LocationRequest request,
            Authentication authentication) {
        try {
            User student = resolveUser(authentication);
            Location saved = locationService.saveLocation(student, request);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving location: " + e.getMessage());
        }
    }

    /**
     * GET /api/locations/my/current
     * Returns the student's most recent saved location.
     */
    @GetMapping("/my/current")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<?> getMyCurrentLocation(Authentication authentication) {
        try {
            User student = resolveUser(authentication);
            return locationService.getCurrentLocation(student)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching location: " + e.getMessage());
        }
    }

    /**
     * GET /api/locations/my/history
     * Returns all locations the student has recorded (newest first).
     */
    @GetMapping("/my/history")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<?> getMyHistory(Authentication authentication) {
        try {
            User student = resolveUser(authentication);
            List<Location> history = locationService.getHistory(student);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching location history: " + e.getMessage());
        }
    }

    // ─── Supervisor / Admin endpoints ─────────────────────────────────────────

    /**
     * GET /api/locations/student/{studentId}/current
     * Returns the most recent location for a specific student.
     */
    @GetMapping("/student/{studentId}/current")
    @PreAuthorize("hasRole('ROLE_SUPERVISOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getStudentCurrentLocation(@PathVariable Long studentId) {
        try {
            User student = userService.getUserById(studentId);
            return locationService.getCurrentLocation(student)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching student location: " + e.getMessage());
        }
    }

    /**
     * GET /api/locations/student/{studentId}/history
     * Returns the full location history for a specific student.
     */
    @GetMapping("/student/{studentId}/history")
    @PreAuthorize("hasRole('ROLE_SUPERVISOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getStudentHistory(@PathVariable Long studentId) {
        try {
            User student = userService.getUserById(studentId);
            List<Location> history = locationService.getHistory(student);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching student location history: " + e.getMessage());
        }
    }

    /**
     * GET /api/locations/all/latest
     * Returns the most recent location for every student (admin/supervisor overview).
     */
    @GetMapping("/all/latest")
    @PreAuthorize("hasRole('ROLE_SUPERVISOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAllLatestLocations() {
        try {
            List<Location> locations = locationService.getAllLatest();
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching all locations: " + e.getMessage());
        }
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private User resolveUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userService.getUserByEmail(userDetails.getUsername());
    }
}
