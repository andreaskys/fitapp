package com.clinic.nutr.controller;

import com.clinic.nutr.entity.Clinic;
import com.clinic.nutr.entity.Nutritionist;
import com.clinic.nutr.repository.ClinicRepository;
import com.clinic.nutr.repository.NutritionistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
    private final NutritionistRepository nutritionistRepository;


    @GetMapping
    public ResponseEntity<List<Clinic>> getAllClinics(Principal principal){
        String userEmail = principal.getName();
        List<Clinic> userClinics = clinicRepository.findByNutritionist_Email(userEmail);
        return ResponseEntity.ok(userClinics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Clinic> getClinicById(@PathVariable Long id) {
        return clinicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Clinic> createClinic(@RequestBody Clinic clinic, Principal principal){
        String userEmail = principal.getName();
        Nutritionist owner = nutritionistRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found!"));
        clinic.setNutritionist(owner);
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
    public ResponseEntity<Map<String, Object>> getClinicMetrics(@PathVariable Long id, Principal principal) {
        Optional<Clinic> clinicOpt = clinicRepository.findByIdAndNutritionist_Email(id, principal.getName());
        if (clinicOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Clinic clinic = clinicOpt.get();
        int totalPatients = clinic.getPatients().size();
        LocalDate today = LocalDate.now();
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
