package com.clinic.nutr.config;

import com.clinic.nutr.entity.Nutritionist;
import com.clinic.nutr.repository.NutritionistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final NutritionistRepository nutritionistRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAccountIfNotFound("Andreas", "andreas@gmail.com", "Anglo2003");
        createAccountIfNotFound("Lorena Morgana", "lorena@gmail.com", "Abudog2026");
        createAccountIfNotFound("Júlio Cesar", "julio@gmail.com", "Abudog2026");
        System.out.println("✅ Database Seeding Complete. Secure accounts verified.");
    }

    private void createAccountIfNotFound(String name, String email, String rawPassword) {
        var existingUser = nutritionistRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            Nutritionist user = new Nutritionist();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            nutritionistRepository.save(user);
        } else {
            Nutritionist user = existingUser.get();
            user.setPassword(passwordEncoder.encode(rawPassword));
            nutritionistRepository.save(user);
        }
    }
}