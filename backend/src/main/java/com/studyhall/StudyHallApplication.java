package com.studyhall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudyHallApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyHallApplication.class, args);
    }
}
