package com.clinic.nutr.repository;

import com.clinic.nutr.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientClinicIdAndAppointmentDate(Long clinicId, LocalDate date);
}
