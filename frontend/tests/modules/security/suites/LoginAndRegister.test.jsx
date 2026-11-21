/**
 * Bộ kịch bản kiểm thử Frontend trên RAM — Mục 1 (Nhóm 1.1 & 1.2): Đăng nhập, Đăng xuất & Đăng ký.
 * Tuân thủ cấu trúc AAA (Arrange - Act - Assert) và ánh xạ 1-1 với chuẩn ISO/IEC/IEEE 29119-3.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../../../../src/pages/LoginPage';
import RegisterPage from '../../../../src/pages/RegisterPage';
import { useAuth } from '../../../../src/context/auth';
import {
  renderWithAuthRouter,
  mockFetchOk,
  mockFetchError,
} from '../fixtures/securityTestUtils';

// Component phụ trợ gọn nhẹ để kiểm thử hành vi gọi logout() từ AuthContext trên RAM
function LogoutTriggerHarness() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'CHUA_DANG_NHAP'}</span>
      <button type="button" onClick={logout}>
        Đăng xuất
      </button>
    </div>
  );
}

describe('Mục 1 (FE Security trên RAM) - Nhóm 1.1: Đăng nhập & Đăng xuất', () => {
  it('[TC-FE-SEC-01] Đăng nhập hợp lệ lưu Token vào localStorage và chuyển sang /overview', async () => {
    // 1. Arrange (Chuẩn bị): Giả lập API /api/v1/auth/login trả về cặp token hợp lệ
    const fetchMock = mockFetchOk({
      access_token: 'jwt-access-token-123',
      refresh_token: 'refresh-token-456',
      user: { id: 'u1', email: 'manager@higen.vn', full_name: 'Quản Lý', role: 'STORE_MANAGER' },
    });

    renderWithAuthRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/overview" element={<div>Trang Tổng Quan</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    // 2. Act (Thực thi): Nhập email, mật khẩu và bấm Đăng nhập
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
      target: { value: 'manager@higen.vn' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
      target: { value: 'Secret@123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    // 3. Assert (Kiểm chứng): Chuyển sang /overview và lưu đủ khóa phiên trong localStorage
    await waitFor(() => {
      expect(screen.getByText('Trang Tổng Quan')).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('absa_token')).toBe('jwt-access-token-123');
    expect(localStorage.getItem('absa_refresh_token')).toBe('refresh-token-456');
    expect(JSON.parse(localStorage.getItem('absa_user')).email).toBe('manager@higen.vn');
  });

  it('[TC-FE-SEC-02] Đăng nhập sai mật khẩu (HTTP 401) giữ nguyên trang Login và hiện thông báo lỗi', async () => {
    // 1. Arrange (Chuẩn bị): Giả lập Backend trả về 401 với thông báo lỗi chuẩn OWASP
    mockFetchError(401, { detail: 'Invalid email or password.' });

    renderWithAuthRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/overview" element={<div>Trang Tổng Quan</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    // 2. Act (Thực thi): Nhập sai mật khẩu và bấm Đăng nhập
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), {
      target: { value: 'victim@higen.vn' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập mật khẩu'), {
      target: { value: 'WrongPassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    // 3. Assert (Kiểm chứng): Hiển thị lỗi ngay trên form, không lưu token và không chuyển trang
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeTruthy();
    });
    expect(localStorage.getItem('absa_token')).toBeNull();
    expect(screen.queryByText('Trang Tổng Quan')).toBeNull();
  });

  it('[TC-FE-SEC-03] Bấm biểu tượng con mắt bật/tắt hiển thị mật khẩu', () => {
    // 1. Arrange (Chuẩn bị): Mở giao diện LoginPage trên RAM
    renderWithAuthRouter(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { initialEntries: ['/login'] }
    );
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    expect(passwordInput.getAttribute('type')).toBe('password');

    // 2. Act (Thực thi): Tìm nút toggle mật khẩu và bấm 2 lần
    const eyeButton = passwordInput.parentElement.querySelector('button[type="button"]');
    fireEvent.click(eyeButton);

    // 3. Assert (Kiểm chứng): Đổi sang text (hiện chữ) rồi quay lại password (ẩn chữ)
    expect(passwordInput.getAttribute('type')).toBe('text');
    fireEvent.click(eyeButton);
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('[TC-FE-SEC-04-LOGOUT] Đăng xuất gọi API thu hồi token và xóa sạch phiên trong localStorage', async () => {
    // 1. Arrange (Chuẩn bị): Đặt sẵn phiên đăng nhập hợp lệ trong localStorage
    localStorage.setItem('absa_token', 'active-access-token');
    localStorage.setItem('absa_refresh_token', 'active-refresh-token');
    localStorage.setItem('absa_user', JSON.stringify({ email: 'staff@higen.vn', role: 'CSKH_STAFF' }));

    const fetchMock = mockFetchOk({ message: 'Logged out successfully.' });

    renderWithAuthRouter(<LogoutTriggerHarness />);
    expect(screen.getByTestId('user-email').textContent).toBe('staff@higen.vn');

    // 2. Act (Thực thi): Bấm nút Đăng xuất
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));

    // 3. Assert (Kiểm chứng): Đã gửi refresh_token lên /api/v1/auth/logout và xóa sạch localStorage
    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('CHUA_DANG_NHAP');
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/auth/logout');
    expect(localStorage.getItem('absa_token')).toBeNull();
    expect(localStorage.getItem('absa_refresh_token')).toBeNull();
    expect(localStorage.getItem('absa_user')).toBeNull();
  });
});

describe('Mục 1 (FE Security trên RAM) - Nhóm 1.2: Đăng ký tài khoản', () => {
  it('[TC-FE-SEC-05] Đăng ký hợp lệ gửi vai trò STORE_MANAGER, lưu Token và điều hướng /overview', async () => {
    // 1. Arrange (Chuẩn bị): Giả lập API đăng ký thành công
    const fetchMock = mockFetchOk({
      access_token: 'reg-access-token',
      refresh_token: 'reg-refresh-token',
      user: { id: 'u2', email: 'newshop@higen.vn', role: 'STORE_MANAGER' },
    });

    renderWithAuthRouter(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/overview" element={<div>Trang Tổng Quan</div>} />
      </Routes>,
      { initialEntries: ['/register'] }
    );

    // 2. Act (Thực thi): Điền đầy đủ thông tin hợp lệ và bấm Tạo tài khoản
    fireEvent.change(screen.getByPlaceholderText('Nhập họ và tên'), { target: { value: 'Chủ Shop Mới' } });
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), { target: { value: 'newshop@higen.vn' } });
    fireEvent.change(screen.getByPlaceholderText('Tạo mật khẩu'), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByPlaceholderText('Nhập lại mật khẩu'), { target: { value: 'Password@123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));

    // 3. Assert (Kiểm chứng): Body gửi đi có role = STORE_MANAGER và lưu token mới
    await waitFor(() => {
      expect(screen.getByText('Trang Tổng Quan')).toBeTruthy();
    });
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.role).toBe('STORE_MANAGER');
    expect(localStorage.getItem('absa_token')).toBe('reg-access-token');
  });

  it('[TC-FE-SEC-06] Chặn gửi API khi Mật khẩu và Xác nhận mật khẩu không khớp', () => {
    // 1. Arrange (Chuẩn bị): Tạo hàm theo dõi fetch để chắc chắn không gọi mạng
    const fetchMock = mockFetchOk({});

    renderWithAuthRouter(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { initialEntries: ['/register'] }
    );

    // 2. Act (Thực thi): Nhập 2 mật khẩu lệch nhau và bấm Tạo tài khoản
    fireEvent.change(screen.getByPlaceholderText('Nhập họ và tên'), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn'), { target: { value: 'test@higen.vn' } });
    fireEvent.change(screen.getByPlaceholderText('Tạo mật khẩu'), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByPlaceholderText('Nhập lại mật khẩu'), { target: { value: 'KhacNhau@456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));

    // 3. Assert (Kiểm chứng): Báo lỗi ngay trên UI và không gọi API
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
