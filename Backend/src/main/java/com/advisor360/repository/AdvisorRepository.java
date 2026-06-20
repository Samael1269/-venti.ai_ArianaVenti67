package com.advisor360.repository;
import com.advisor360.entity.Advisor;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AdvisorRepository extends JpaRepository<Advisor, Long>{
}
