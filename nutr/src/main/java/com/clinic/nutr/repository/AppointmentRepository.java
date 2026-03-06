package com.clinic.nutr.repository;

import com.clinic.nutr.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientClinicIdAndAppointmentDate(Long clinicId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient.clinic.id = :clinicId AND a.appointmentDate = :today")
    long countAppointmentsTodayByClinic(@Param("clinicId") Long clinicId, @Param("today") LocalDate today);
}
