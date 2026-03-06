package com.clinic.nutr.controller;

import com.clinic.nutr.entity.Clinic;
import com.clinic.nutr.repository.ClinicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/clinics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ClinicController {

    private final ClinicRepository clinicRepository;

    @GetMapping
    public List<Clinic> getAllClinics(){
        return clinicRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Clinic> getClinicById(@PathVariable Long id) {
        return clinicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Clinic> createClinic(@RequestBody Clinic clinic){
        Clinic savedClinic = clinicRepository.save(clinic);
        return ResponseEntity.ok(savedClinic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClinic(@PathVariable Long id){
        if (clinicRepository.existsById(id)){
            clinicRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/metrics")
    public ResponseEntity<Map<String, Object>> getClinicMetrics(@PathVariable Long id) {
        Optional<Clinic> clinicOpt = clinicRepository.findById(id);
        if (clinicOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Clinic clinic = clinicOpt.get();
        int totalPatients = clinic.getPatients().size();
        String today = LocalDate.now().toString();
        long appointmentsToday = clinic.getPatients().stream()
                .flatMap(patient -> patient.getAppointments().stream())
                .filter(appointment -> today.equals(appointment.getAppointmentDate()))
                .count();
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalPatients", totalPatients);
        metrics.put("appointmentsToday", appointmentsToday);
        return ResponseEntity.ok(metrics);
    }


}
