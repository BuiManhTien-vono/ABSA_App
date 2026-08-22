import { useEffect, useState } from 'react';
import { Users, Plus, Shield, CheckCircle, XCircle } from 'lucide-react';
import userService from '../services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', role: 'STORE_MANAGER' });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await userService.getUsers({ pageSize: 50 });
      setUsers(res?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      setShowModal(false);
      setFormData({ email: '', password: '', fullName: '', role: 'STORE_MANAGER' });
      loadUsers();
    } catch (err) {
      alert('Lỗi tạo tài khoản: ' + err.message);
    }
  }

  async function handleToggleActive(user) {
    try {
      await userService.updateUser(user.id, { isActive: !user.isActive });
      loadUsers();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Tài Khoản Người Dùng (Admin)</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Phân quyền vai trò hệ thống (ADMIN, STORE_MANAGER, CSKH_STAFF)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Tạo Tài Khoản Mới
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>Họ và Tên</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Vai Trò (Role)</th>
              <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
              <th style={{ padding: '12px 16px' }}>Ngày Tạo</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Đang tải danh sách user...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{u.fullName}</td>
                <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                    background: u.role === 'ADMIN' ? '#fef3c7' : u.role === 'CSKH_STAFF' ? '#e0e7ff' : '#f1f5f9',
                    color: u.role === 'ADMIN' ? '#92400e' : u.role === 'CSKH_STAFF' ? '#3730a3' : '#475569'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#15803d' : '#b91c1c' }}>
                    {u.isActive ? 'Active' : 'Locked'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleActive(u)}
                    style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {u.isActive ? 'Khóa TK' : 'Mở Khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create User */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Tạo User Mới</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Họ và Tên</label>
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Mật khẩu</label>
                <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>Vai trò (Role)</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <option value="STORE_MANAGER">Quản lý cửa hàng (STORE_MANAGER)</option>
                  <option value="CSKH_STAFF">Nhân viên CSKH (CSKH_STAFF)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
