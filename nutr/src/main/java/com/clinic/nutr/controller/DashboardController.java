package com.clinic.nutr.controller;

import com.clinic.nutr.entity.Appointment;
import com.clinic.nutr.entity.Patient;
import com.clinic.nutr.repository.AppointmentRepository;
import com.clinic.nutr.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clinics/{clinicId}/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public record AppointmentDTO(Long id, String patientName, Double weight, Integer dietNumber) {}

    @GetMapping
    public ResponseEntity<?> getDashboardData(@PathVariable Long clinicId) {
        LocalDate today = LocalDate.now();

        List<Patient> allPatients = patientRepository.findByClinicId(clinicId);

        List<AppointmentDTO> todaysAppointments = appointmentRepository
                .findByPatientClinicIdAndAppointmentDate(clinicId, today)
                .stream()
                .map(app -> new AppointmentDTO(
                        app.getId(),
                        app.getPatient().getName(),
                        app.getWeight(),
                        app.getDietNumber()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "todaysAppointments", todaysAppointments,
                "patients", allPatients
        ));
    }
}