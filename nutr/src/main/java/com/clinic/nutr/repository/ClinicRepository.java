package com.clinic.nutr.repository;

import com.clinic.nutr.entity.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    Optional<Clinic> findByIdAndNutritionist_Email(Long id, String email);

    List<Clinic> findByNutritionist_Email(String email);

}
