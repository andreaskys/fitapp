package com.clinic.nutr.controller;

import com.clinic.nutr.entity.Nutritionist;
import com.clinic.nutr.repository.NutritionistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final NutritionistRepository nutritionistRepository;

    @GetMapping("/me")
    public ResponseEntity<Nutritionist> getCurrentUser(Principal principal){
        return nutritionistRepository.findByEmail(principal.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<Nutritionist> updateProfile(@RequestBody Nutritionist updateRequest, Principal principal){
        Nutritionist user = nutritionistRepository.findByEmail(principal.getName())
                .orElseThrow(()-> new RuntimeException("User not found!"));
        user.setName(updateRequest.getName());
        Nutritionist savedUser = nutritionistRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
