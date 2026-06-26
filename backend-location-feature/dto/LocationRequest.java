package com.example.logbook.dto;

import lombok.Data;

@Data
public class LocationRequest {
    private Double latitude;
    private Double longitude;
    private String address;
    private String capturedAt; // ISO-8601 string from frontend
}
