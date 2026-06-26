package com.example.logbook.service;

import com.example.logbook.dto.LocationRequest;
import com.example.logbook.model.Location;
import com.example.logbook.model.User;
import com.example.logbook.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    @Autowired
    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    /** Save a new location record submitted by the student */
    @Transactional
    public Location saveLocation(User student, LocationRequest request) {
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("Latitude and longitude are required");
        }

        Location location = new Location();
        location.setStudent(student);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAddress(request.getAddress());

        // Parse ISO-8601 timestamp sent from the browser, fall back to now
        if (request.getCapturedAt() != null && !request.getCapturedAt().isBlank()) {
            try {
                location.setCapturedAt(
                    OffsetDateTime.parse(request.getCapturedAt()).toLocalDateTime()
                );
            } catch (Exception e) {
                location.setCapturedAt(LocalDateTime.now());
            }
        } else {
            location.setCapturedAt(LocalDateTime.now());
        }

        return locationRepository.save(location);
    }

    /** Most recent location for a student */
    @Transactional(readOnly = true)
    public Optional<Location> getCurrentLocation(User student) {
        return locationRepository.findTopByStudentOrderByCapturedAtDesc(student);
    }

    /** Full history for a student */
    @Transactional(readOnly = true)
    public List<Location> getHistory(User student) {
        return locationRepository.findByStudentOrderByCapturedAtDesc(student);
    }

    /** Latest location for every student (admin/supervisor view) */
    @Transactional(readOnly = true)
    public List<Location> getAllLatest() {
        return locationRepository.findLatestLocationPerStudent();
    }
}
