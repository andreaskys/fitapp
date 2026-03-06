package com.clinic.nutr.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "clinics", indexes = {
        @Index(name = "idx_clinic_nutritionist_id", columnList = "nutritionist_id")
})
public class Clinic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "clinic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Patient> patients = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "nutritionist_id")
    @JsonIgnore
    private Nutritionist nutritionist;

}
