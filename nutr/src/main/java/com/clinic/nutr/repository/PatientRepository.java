package com.clinic.nutr.repository;

import com.clinic.nutr.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByClinicId(Long clinicId);

    List<Patient> findByClinic_IdAndClinic_Nutritionist_Email(Long clinicId, String email);

    Optional<Patient> findByIdAndClinic_Nutritionist_Email(Long id, String email);

    long countByClinic_IdAndClinic_Nutritionist_Email(Long clinicId, String email);
}
