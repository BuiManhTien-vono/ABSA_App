/**
 * Phòng thí nghiệm giả lập trên RAM (Test Fixture) cho Module 1: Security FE.
 * Cung cấp hàm bọc AuthProvider + MemoryRouter và các hàm giả lập API (Mock Fetch) dùng chung.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../../../../src/context/AuthContext';

/**
 * Bọc Component cần kiểm thử trong AuthProvider và MemoryRouter trên RAM.
 */
export function renderWithAuthRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>
  );
}

/**
 * Giả lập fetch trả về kết quả thành công (HTTP 200) trên RAM.
 */
export function mockFetchOk(payload, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: async () => payload,
  });
  globalThis.fetch = fn;
  return fn;
}

/**
 * Giả lập fetch trả về lỗi HTTP (400, 401, 403, 500...) trên RAM.
 */
export function mockFetchError(status, payload = { detail: 'Request failed' }) {
  const fn = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => payload,
  });
  globalThis.fetch = fn;
  return fn;
}
