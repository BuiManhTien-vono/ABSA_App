import { useState } from 'react';
import { Lock, User, CheckCircle2 } from 'lucide-react';
import userService from '../services/userService';
import { useAuth } from '../context/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      await userService.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setMessage('Đổi mật khẩu thành công!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px 0', color: '#1e293b' }}>Cài Đặt Tài Khoản & Bảo Mật</h1>

      {/* Profile summary */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} /> Thông tin Tài Khoản
        </h2>
        <div style={{ fontSize: '13px', color: '#475569', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
          <strong>Họ và tên:</strong> <span>{user?.fullName || user?.full_name || 'N/A'}</span>
          <strong>Email:</strong> <span>{user?.email || 'N/A'}</span>
          <strong>Vai trò:</strong> <span style={{ fontWeight: 600, color: '#4f46e5' }}>{user?.role || 'STORE_MANAGER'}</span>
        </div>
      </div>

      {/* Change Password Form */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} /> Đổi Mật Khẩu (NV1-B)
        </h2>

        {message && (
          <div style={{ background: '#f0fdf4', color: '#15803d', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#4f46e5', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
          >
            {submitting ? 'Đang lưu...' : 'Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
