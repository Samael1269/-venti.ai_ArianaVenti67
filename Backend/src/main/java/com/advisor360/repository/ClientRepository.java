package com.advisor360.repository;

import com.advisor360.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByAdvisorAdvisorIdOrderByCreatedAtDesc(Long advisorId);

    boolean existsByEmailAndAdvisorAdvisorId(String email, Long advisorId);
}
