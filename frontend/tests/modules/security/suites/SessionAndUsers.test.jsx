/**
 * Bộ kịch bản kiểm thử Frontend trên RAM — Mục 1 (Nhóm 1.3 & 1.4):
 * Bảo vệ đường dẫn (RequireAuth), Xử lý hết hạn Token 401 (ApiClient) và Quản lý tài khoản Admin (UsersPage).
 * Tuân thủ cấu trúc AAA và ánh xạ 1-1 với chuẩn ISO/IEC/IEEE 29119-3.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import UsersPage from '../../../../src/pages/UsersPage';
import apiClient from '../../../../src/services/apiClient';
import { renderWithAuthRouter, mockFetchError } from '../fixtures/securityTestUtils';

// Mock nhẹ các trang lớn để kiểm thử nhanh cơ chế RequireAuth của App.jsx trên RAM
vi.mock('../../../../src/pages/OverviewPage', () => ({
  default: () => <div>Mock Overview Page</div>,
}));

import App from '../../../../src/App';

describe('Mục 1 (FE Security trên RAM) - Nhóm 1.3: Bảo vệ đường dẫn & Token 401', () => {
  it('[TC-FE-SEC-08] Chặn truy cập trang nội bộ (/overview) khi chưa đăng nhập và tự đẩy về /login', async () => {
    // 1. Arrange (Chuẩn bị): localStorage trống hoàn toàn, đặt URL trình duyệt giả lập ở /overview
    window.history.pushState({}, '', '/overview');

    // 2. Act (Thực thi): Khởi chạy App (chứa RequireAuth)
    render(<App />);

    // 3. Assert (Kiểm chứng): Người dùng bị đẩy về trang Đăng nhập, không thấy trang Tổng quan
    await waitFor(() => {
      expect(screen.getByText('Đăng nhập khách hàng')).toBeTruthy();
    });
    expect(screen.queryByText('Mock Overview Page')).toBeNull();
  });

  it('[TC-FE-SEC-09] ApiClient tự đính kèm Bearer Token và xóa sạch phiên khi API trả về HTTP 401', async () => {
    // 1. Arrange (Chuẩn bị): Có sẵn token trong localStorage và giả lập API trả về 401
    localStorage.setItem('absa_token', 'expired-token-xyz');
    localStorage.setItem('absa_refresh_token', 'refresh-xyz');
    localStorage.setItem('absa_user', JSON.stringify({ email: 'admin@higen.vn' }));

    const fetchMock = mockFetchError(401, { detail: 'Unauthorized' });

    // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Header có Bearer Token và phiên bị xóa sạch khi 401
    await expect(apiClient.get('/api/v1/users')).rejects.toThrow('Phiên đăng nhập hết hạn.');

    const sentHeaders = fetchMock.mock.calls[0][1].headers;
    expect(sentHeaders['Authorization']).toBe('Bearer expired-token-xyz');
    expect(localStorage.getItem('absa_token')).toBeNull();
    expect(localStorage.getItem('absa_refresh_token')).toBeNull();
    expect(localStorage.getItem('absa_user')).toBeNull();
  });
});

describe('Mục 1 (FE Security trên RAM) - Nhóm 1.4: Quản lý tài khoản Admin (UsersPage)', () => {
  it('[TC-FE-SEC-11A] Lọc danh sách tài khoản trên UsersPage theo từ khóa và vai trò', async () => {
    // 1. Arrange (Chuẩn bị): Giả lập API trả về 2 nhân viên khác vai trò
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'u-admin',
            email: 'admin@higen.vn',
            fullName: 'An Quản Trị',
            role: 'ADMIN',
            isActive: true,
            createdAt: '2026-10-01T00:00:00Z',
          },
          {
            id: 'u-cskh',
            email: 'chi@higen.vn',
            fullName: 'Chi Hỗ Trợ',
            role: 'CSKH_STAFF',
            isActive: true,
            createdAt: '2026-10-02T00:00:00Z',
          },
        ],
        totalCount: 2,
      }),
    });

    renderWithAuthRouter(
      <Routes>
        <Route path="/users" element={<UsersPage />} />
      </Routes>,
      { initialEntries: ['/users'] }
    );

    await waitFor(() => {
      expect(screen.getByText('An Quản Trị')).toBeTruthy();
      expect(screen.getByText('Chi Hỗ Trợ')).toBeTruthy();
    });

    // 2. Act (Thực thi): Gõ từ khóa "Chi" vào ô tìm kiếm
    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên hoặc email người dùng...'), {
      target: { value: 'Chi' },
    });

    // 3. Assert (Kiểm chứng): Chỉ còn hiển thị Chi Hỗ Trợ, An Quản Trị đã được lọc ẩn
    expect(screen.getByText('Chi Hỗ Trợ')).toBeTruthy();
    expect(screen.queryByText('An Quản Trị')).toBeNull();
  });

  it('[TC-FE-SEC-11B] Tạo tài khoản nhân viên mới và Khóa tài khoản trên UsersPage', async () => {
    // 1. Arrange (Chuẩn bị): Giả lập 3 API GET danh sách, POST tạo mới và PUT khóa tài khoản
    const usersDb = [
      {
        id: 'staff-1',
        email: 'cskh@higen.vn',
        fullName: 'Nhân Viên CSKH',
        role: 'CSKH_STAFF',
        isActive: true,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ];

    globalThis.fetch = vi.fn((url, options) => {
      const method = options?.method || 'GET';
      if (method === 'GET') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ items: [...usersDb], totalCount: usersDb.length }),
        });
      }
      if (method === 'POST') {
        const body = JSON.parse(options.body);
        const created = {
          id: 'staff-2',
          ...body,
          isActive: true,
          createdAt: '2026-10-05T00:00:00Z',
        };
        usersDb.push(created);
        return Promise.resolve({ ok: true, status: 201, json: async () => created });
      }
      if (method === 'PUT') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ...usersDb[0], isActive: false }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    });

    renderWithAuthRouter(
      <Routes>
        <Route path="/users" element={<UsersPage />} />
      </Routes>,
      { initialEntries: ['/users'] }
    );

    await waitFor(() => {
      expect(screen.getByText('Nhân Viên CSKH')).toBeTruthy();
    });

    // 2. Act (Thực thi): Mở modal tạo mới, điền thông tin nhân viên và bấm Khóa TK đầu tiên
    fireEvent.click(screen.getByRole('button', { name: /Tạo Tài Khoản Mới/i }));
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: Nguyễn Văn A'), { target: { value: 'Bình Quản Lý' } });
    fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'binh@higen.vn' } });
    fireEvent.change(screen.getByPlaceholderText('Tối thiểu 6 ký tự'), { target: { value: 'Secret@123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo Tài Khoản' }));

    await waitFor(() => {
      expect(screen.getByText('Bình Quản Lý')).toBeTruthy();
    });

    const lockButtons = screen.getAllByRole('button', { name: /Khóa TK/i });
    fireEvent.click(lockButtons[0]);

    // 3. Assert (Kiểm chứng): Tài khoản chuyển trạng thái từ Hoạt động sang Bị khóa
    await waitFor(() => {
      expect(screen.getByText('Bị khóa')).toBeTruthy();
    });
  });
});
