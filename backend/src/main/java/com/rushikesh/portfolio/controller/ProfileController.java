package com.rushikesh.portfolio.controller;

import com.rushikesh.portfolio.config.OpenApiConfig;
import com.rushikesh.portfolio.dto.PortfolioDto;
import com.rushikesh.portfolio.dto.ProfileDto;
import com.rushikesh.portfolio.service.PortfolioService;
import com.rushikesh.portfolio.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Profile")
public class ProfileController {

    private final ProfileService profileService;
    private final PortfolioService portfolioService;

    public ProfileController(ProfileService profileService, PortfolioService portfolioService) {
        this.profileService = profileService;
        this.portfolioService = portfolioService;
    }

    @GetMapping("/portfolio")
    @Operation(summary = "All portfolio content in one response (public)")
    public PortfolioDto portfolio() {
        return portfolioService.getAll();
    }

    @GetMapping("/profile")
    @Operation(summary = "Get profile (public)")
    public ProfileDto get() {
        return profileService.get();
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile (admin)", security = @SecurityRequirement(name = OpenApiConfig.BEARER))
    public ProfileDto update(@Valid @RequestBody ProfileDto dto) {
        return profileService.update(dto);
    }
}
