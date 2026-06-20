package com.advisor360.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClientResponse {
    private Long clientId;
    private Long advisorId;
    private String fullName;
    private String email;
    private String phone;
    private String backgroundNotes;
    private LocalDate lastContactDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClientResponse() {
    }

    public ClientResponse(
            Long clientId,
            Long advisorId,
            String fullName,
            String email,
            String phone,
            String backgroundNotes,
            LocalDate lastContactDate,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.clientId = clientId;
        this.advisorId = advisorId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.backgroundNotes = backgroundNotes;
        this.lastContactDate = lastContactDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
