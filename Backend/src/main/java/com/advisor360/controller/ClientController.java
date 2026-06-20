package com.advisor360.controller;
import com.advisor360.dto.ClientRequest;
import com.advisor360.dto.ClientResponse;
import com.advisor360.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")

public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getClients(
            @RequestParam Long advisorId) {

        return ResponseEntity.ok(
                clientService.getClientsByAdvisor(advisorId)
        );
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<ClientResponse> getClient(
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                clientService.getClientById(clientId)
        );
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(
            @Valid @RequestBody ClientRequest request) {

        ClientResponse createdClient = clientService.createClient(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdClient);
    }

    @PutMapping("/{clientId}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable Long clientId,
            @Valid @RequestBody ClientRequest request) {

        return ResponseEntity.ok(
                clientService.updateClient(clientId, request)
        );
    }

    @DeleteMapping("/{clientId}")
    public ResponseEntity<Void> deleteClient(
            @PathVariable Long clientId) {

        clientService.deleteClient(clientId);

        return ResponseEntity.noContent().build();
    }
}
