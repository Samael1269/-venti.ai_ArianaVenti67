package com.advisor360.service;

import com.advisor360.dto.ClientRequest;
import com.advisor360.dto.ClientResponse;
import com.advisor360.entity.Advisor;
import com.advisor360.entity.Client;
import com.advisor360.exception.ResourceNotFoundException;
import com.advisor360.repository.AdvisorRepository;
import com.advisor360.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional

public class ClientService {
    private final ClientRepository clientRepository;
    private final AdvisorRepository advisorRepository;

    public ClientService(
            ClientRepository clientRepository,
            AdvisorRepository advisorRepository
    ) {
        this.clientRepository = clientRepository;
        this.advisorRepository = advisorRepository;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getClientsByAdvisor(Long advisorId) {

        if (!advisorRepository.existsById(advisorId)) {
            throw new ResourceNotFoundException(
                    "Advisor with ID " + advisorId + " was not found"
            );
        }

        return clientRepository
                .findByAdvisorAdvisorIdOrderByCreatedAtDesc(advisorId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(Long clientId) {
        Client client = findClient(clientId);
        return convertToResponse(client);
    }

    public ClientResponse createClient(ClientRequest request) {

        Advisor advisor = advisorRepository.findById(request.getAdvisorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Advisor with ID "
                                + request.getAdvisorId()
                                + " was not found"
                ));

        String email = normalizeOptionalValue(request.getEmail());

        if (email != null
                && clientRepository.existsByEmailAndAdvisorAdvisorId(
                email,
                request.getAdvisorId()
        )) {

            throw new IllegalArgumentException(
                    "A client with this email is already registered under this advisor"
            );
        }

        Client client = new Client();

        client.setAdvisor(advisor);
        client.setFullName(request.getFullName().trim());
        client.setEmail(email);
        client.setPhone(normalizeOptionalValue(request.getPhone()));
        client.setBackgroundNotes(
                normalizeOptionalValue(request.getBackgroundNotes())
        );
        client.setLastContactDate(request.getLastContactDate());

        Client savedClient = clientRepository.save(client);

        return convertToResponse(savedClient);
    }

    public ClientResponse updateClient(
            Long clientId,
            ClientRequest request
    ) {

        Client client = findClient(clientId);

        Advisor advisor = advisorRepository.findById(request.getAdvisorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Advisor with ID "
                                + request.getAdvisorId()
                                + " was not found"
                ));

        String email = normalizeOptionalValue(request.getEmail());

        client.setAdvisor(advisor);
        client.setFullName(request.getFullName().trim());
        client.setEmail(email);
        client.setPhone(normalizeOptionalValue(request.getPhone()));
        client.setBackgroundNotes(
                normalizeOptionalValue(request.getBackgroundNotes())
        );
        client.setLastContactDate(request.getLastContactDate());

        Client updatedClient = clientRepository.save(client);

        return convertToResponse(updatedClient);
    }

    public void deleteClient(Long clientId) {
        Client client = findClient(clientId);
        clientRepository.delete(client);
    }

    private Client findClient(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Client with ID " + clientId + " was not found"
                ));
    }

    private ClientResponse convertToResponse(Client client) {

        return new ClientResponse(
                client.getClientId(),
                client.getAdvisor().getAdvisorId(),
                client.getFullName(),
                client.getEmail(),
                client.getPhone(),
                client.getBackgroundNotes(),
                client.getLastContactDate(),
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }

    private String normalizeOptionalValue(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

}
