package com.feedbackai.service;

import com.feedbackai.dto.request.ReportGenerateReq;
import com.feedbackai.dto.response.ReportDto;
import com.feedbackai.entity.Report;
import com.feedbackai.entity.User;
import com.feedbackai.repository.ReportRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public List<ReportDto> getReportsByUser(Long userId) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public ReportDto getReportById(Long id) {
        return toDto(reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report not found: " + id)));
    }

    @Transactional
    public ReportDto generateReport(User user, ReportGenerateReq req) {
        Report report = Report.builder()
                .user(user)
                .title(req.getTitle() != null ? req.getTitle() : "Report")
                .type(req.getType() != null ? req.getType() : "GENERAL")
                .status("PENDING")
                .parameters(req.getParameters())
                .build();

        report = reportRepository.save(report);
        return toDto(report);
    }

    private ReportDto toDto(Report r) {
        return ReportDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .type(r.getType())
                .status(r.getStatus())
                .fileUrl(r.getFileUrl())
                .parameters(r.getParameters())
                .createdAt(r.getCreatedAt())
                .completedAt(r.getCompletedAt())
                .build();
    }
}
