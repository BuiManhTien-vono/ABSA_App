/**
 * Thiết lập môi trường kiểm thử FE trên RAM (jsdom) dùng chung cho toàn bộ các module.
 * Tự động dọn dẹp DOM và bộ nhớ tạm sau mỗi ca kiểm thử để đảm bảo tính cô lập chuẩn ISO.
 */

import { beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});
