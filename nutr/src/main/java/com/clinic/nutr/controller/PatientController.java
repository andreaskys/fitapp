package com.clinic.nutr.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clinic.nutr.entity.Appointment;
import com.clinic.nutr.entity.Clinic;
import com.clinic.nutr.entity.Patient;
import com.clinic.nutr.repository.AppointmentRepository;
import com.clinic.nutr.repository.ClinicRepository;
import com.clinic.nutr.repository.PatientRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ClinicRepository clinicRepository;

    @GetMapping
    public List<Patient> getAllPatients(@RequestParam(required = false) Long clinicId) {
        if (clinicId != null) {
            return patientRepository.findByClinicId(clinicId);
        }
        return patientRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient, @RequestParam Long clinicId){
        Clinic managedClinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic Workspace not found"));
        patient.setClinic(managedClinic);
        Patient savedPatient = patientRepository.save(patient);
        return ResponseEntity.ok(savedPatient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{patientId}/appointments")
    public ResponseEntity<Appointment> addAppointment(@PathVariable Long patientId, @RequestBody Appointment appointment) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Patient patient = patientOpt.get();
        appointment.setPatient(patient);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return ResponseEntity.ok(savedAppointment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patientDetails) {
        return patientRepository.findById(id).map(patient -> {
            // 1. Personal Info
            patient.setName(patientDetails.getName());
            patient.setNickname(patientDetails.getNickname());
            patient.setBirthDate(patientDetails.getBirthDate());
            patient.setInstagramUser(patientDetails.getInstagramUser());
            patient.setPhoneNumber(patientDetails.getPhoneNumber());
            patient.setOccupation(patientDetails.getOccupation());
            patient.setAge(patientDetails.getAge());
            patient.setReferralSource(patientDetails.getReferralSource());

            // 2. Clinical History
            patient.setDiabetes(patientDetails.getDiabetes());
            patient.setHypertension(patientDetails.getHypertension());
            patient.setCholesterol(patientDetails.getCholesterol());
            patient.setTriglycerides(patientDetails.getTriglycerides());
            patient.setHypothyroidism(patientDetails.getHypothyroidism());
            patient.setDesiredWeight(patientDetails.getDesiredWeight());

            // 3. Habits
            patient.setDoesNotConsume(patientDetails.getDoesNotConsume());
            patient.setPerformsPhysicalActivity(patientDetails.getPerformsPhysicalActivity());
            patient.setPhysicalActivityType(patientDetails.getPhysicalActivityType());
            patient.setPhysicalActivityFrequency(patientDetails.getPhysicalActivityFrequency());
            patient.setObservations(patientDetails.getObservations());

            // 4. Auriculotherapy
            patient.setAuriculotherapyPoints(patientDetails.getAuriculotherapyPoints());

            return ResponseEntity.ok(patientRepository.save(patient));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id){
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
