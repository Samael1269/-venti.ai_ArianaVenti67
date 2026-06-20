package com.advisor360.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ClientRequest {
    @NotNull(message = "Advisor ID is required")
    private Long advisorId;

    @NotBlank(message = "Client full name is required")
    @Size(max = 150, message = "Client name cannot exceed 150 characters")
    private String fullName;

    @Email(message = "Please provide a valid email address")
    @Size(max = 190, message = "Email cannot exceed 190 characters")
    private String email;

    @Size(max = 30, message = "Phone number cannot exceed 30 characters")
    private String phone;

    private String backgroundNotes;

    private LocalDate lastContactDate;

    public ClientRequest() {
    }

    public ClientRequest(
            Long advisorId,
            String fullName,
            String email,
            String phone,
            String backgroundNotes,
            LocalDate lastContactDate
    ) {
        this.advisorId = advisorId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.backgroundNotes = backgroundNotes;
        this.lastContactDate = lastContactDate;
    }

    public Long getAdvisorId() {
        return advisorId;
    }

    public void setAdvisorId(Long advisorId) {
        this.advisorId = advisorId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBackgroundNotes() {
        return backgroundNotes;
    }

    public void setBackgroundNotes(String backgroundNotes) {
        this.backgroundNotes = backgroundNotes;
    }

    public LocalDate getLastContactDate() {
        return lastContactDate;
    }

    public void setLastContactDate(LocalDate lastContactDate) {
        this.lastContactDate = lastContactDate;
    }
}
