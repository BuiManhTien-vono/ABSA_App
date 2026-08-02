package com.feedbackai.controller;

import com.feedbackai.common.ApiResponse;
import com.feedbackai.dto.request.ReportGenerateReq;
import com.feedbackai.dto.response.ReportDto;
import com.feedbackai.entity.User;
import com.feedbackai.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportDto>>> getUserReports(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.getReportsByUser(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportDto>> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getReportById(id)));
    }

    @PostMapping("/export")
    public ResponseEntity<ApiResponse<ReportDto>> exportReport(
            @AuthenticationPrincipal User user,
            @RequestBody ReportGenerateReq request) {
        ReportDto report = reportService.generateReport(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(report));
    }
}
