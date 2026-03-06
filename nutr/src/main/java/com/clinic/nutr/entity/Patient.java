package com.clinic.nutr.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "patients")
@Getter
@Setter
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name", nullable = false)
    private String name;
    private String nickname;
    private LocalDate birthDate;
    private String referralSource;
    private String instagramUser;
    private Integer age;
    private String phoneNumber;
    private String occupation;

    // anamnese
    private String diabetes;
    private String hypertension;
    private String cholesterol;
    private String triglycerides;
    private String hypothyroidism;
    private String desiredWeight;

    // habits
    @ElementCollection
    private List<String> doesNotConsume;
    private Boolean performsPhysicalActivity;
    private String physicalActivityType;
    private Integer physicalActivityFrequency;
    @Column(columnDefinition = "TEXT")
    private String observations;

    // auriculoteraphy
    @ElementCollection
    private List<String> auriculotherapyPoints;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clinic_id", nullable = false)
    @JsonIgnore
    private Clinic clinic;

}
