import { useEffect, useState, useMemo } from 'react';
import { 
  Users, Plus, Shield, ShieldAlert, Headphones, Store, 
  Search, RefreshCw, Lock, Unlock, CheckCircle2, XCircle, 
  UserCheck, AlertCircle, X, Mail, Key, User
} from 'lucide-react';
import userService from '../services/userService';
import './UsersPage.css';

// Gradient colors for user avatars based on initial letter
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
];

function getAvatarBg(name = '') {
  const charCode = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[charCode];
}

function getInitials(name = '') {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STORE_MANAGER'
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await userService.getUsers({ pageSize: 100 });
      setUsers(res?.items || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setErrorMessage('');
    try {
      setIsSubmitting(true);
      await userService.createUser(formData);
      setShowModal(false);
      setFormData({ email: '', password: '', fullName: '', role: 'STORE_MANAGER' });
      loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Không thể tạo tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(user) {
    try {
      await userService.updateUser(user.id, { isActive: !user.isActive });
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
      loadUsers();
    }
  }

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = searchQuery === '' || 
        (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && u.isActive) ||
        (statusFilter === 'LOCKED' && !u.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      cskh: users.filter(u => u.role === 'CSKH_STAFF').length,
      manager: users.filter(u => u.role === 'STORE_MANAGER').length,
    };
  }, [users]);

  const ROLE_LABELS = {
    ADMIN: { label: 'Quản trị viên', icon: ShieldAlert, colorClass: 'ADMIN' },
    CSKH_STAFF: { label: 'CSKH Staff', icon: Headphones, colorClass: 'CSKH_STAFF' },
    STORE_MANAGER: { label: 'Quản lý cửa hàng', icon: Store, colorClass: 'STORE_MANAGER' }
  };

  return (
    <div className="users-page fadeInUp">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1 className="users-title">
            <Users className="text-accent" size={28} />
            Quản lý Tài Khoản Người Dùng
            <span className="users-title-badge">Admin System</span>
          </h1>
          <p className="users-subtitle">
            Phân quyền vai trò hệ thống, cấp phép truy cập và quản lý tài khoản nhân sự
          </p>
        </div>

        <div className="users-actions">
          <button 
            className="btn btn-secondary"
            onClick={loadUsers}
            disabled={loading}
            title="Tải lại danh sách"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Làm mới
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => { setShowModal(true); setErrorMessage(''); }}
          >
            <Plus size={18} />
            Tạo Tài Khoản Mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="users-stats-grid">
        <div className="card user-stat-card total stagger-1">
          <div className="user-stat-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="user-stat-value">{stats.total}</div>
            <div className="user-stat-label">Tổng người dùng</div>
          </div>
        </div>

        <div className="card user-stat-card admin stagger-2">
          <div className="user-stat-icon">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="user-stat-value">{stats.admin}</div>
            <div className="user-stat-label">Quản trị viên (Admin)</div>
          </div>
        </div>

        <div className="card user-stat-card cskh stagger-3">
          <div className="user-stat-icon">
            <Headphones size={24} />
          </div>
          <div>
            <div className="user-stat-value">{stats.cskh}</div>
            <div className="user-stat-label">Nhân viên CSKH</div>
          </div>
        </div>

        <div className="card user-stat-card manager stagger-4">
          <div className="user-stat-icon">
            <Store size={24} />
          </div>
          <div>
            <div className="user-stat-value">{stats.manager}</div>
            <div className="user-stat-label">Quản lý Cửa Hàng</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card users-filter-bar">
        <div className="users-search-box">
          <Search className="users-search-icon" size={18} />
          <input
            type="text"
            className="input users-search-input"
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="users-filter-group">
          <select 
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ minWidth: '170px' }}
          >
            <option value="ALL">Tất cả Vai trò</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
            <option value="CSKH_STAFF">Nhân viên CSKH</option>
            <option value="STORE_MANAGER">Quản lý Cửa Hàng</option>
          </select>

          <select 
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="LOCKED">Bị khóa (Locked)</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người Dùng</th>
              <th>Email</th>
              <th>Vai Trò (Role)</th>
              <th>Trạng Thái</th>
              <th>Ngày Tạo</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="user-info-cell">
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
                      <div>
                        <div className="skeleton" style={{ width: 140, height: 16, marginBottom: 6 }}></div>
                        <div className="skeleton" style={{ width: 100, height: 12 }}></div>
                      </div>
                    </div>
                  </td>
                  <td><div className="skeleton" style={{ width: 160, height: 16 }}></div></td>
                  <td><div className="skeleton" style={{ width: 110, height: 24, borderRadius: 12 }}></div></td>
                  <td><div className="skeleton" style={{ width: 90, height: 24, borderRadius: 12 }}></div></td>
                  <td><div className="skeleton" style={{ width: 100, height: 16 }}></div></td>
                  <td><div className="skeleton" style={{ width: 80, height: 32, borderRadius: 6, marginLeft: 'auto' }}></div></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <UserCheck className="empty-state-icon" size={48} />
                    <h3>Không tìm thấy người dùng nào</h3>
                    <p>Thử thay đổi bộ lọc tìm kiếm hoặc tạo tài khoản mới trong hệ thống.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const roleMeta = ROLE_LABELS[user.role] || { label: user.role, icon: Shield, colorClass: 'STORE_MANAGER' };
                const RoleIcon = roleMeta.icon;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div 
                          className="user-avatar" 
                          style={{ background: getAvatarBg(user.fullName || user.email) }}
                        >
                          {getInitials(user.fullName || user.email)}
                        </div>
                        <div>
                          <div className="user-name">{user.fullName || 'Chưa cập nhật'}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-slate-600)' }}>
                        <Mail size={14} className="text-slate-400" />
                        {user.email}
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge ${roleMeta.colorClass}`}>
                        <RoleIcon size={14} />
                        {roleMeta.label}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill ${user.isActive ? 'active' : 'locked'}`}>
                        <span className="status-dot"></span>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '---'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`btn ${user.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.775rem' }}
                        title={user.isActive ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                      >
                        {user.isActive ? (
                          <>
                            <Lock size={14} /> Khóa TK
                          </>
                        ) : (
                          <>
                            <Unlock size={14} /> Mở Khóa
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create User */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content scaleIn" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                    Tạo Tài Khoản Mới
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                    Cấp quyền nhân sự mới vào hệ thống ABSA
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-slate-400)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--color-danger-subtle)', 
                color: 'var(--color-danger)', 
                fontSize: '0.85rem', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label" style={{ marginBottom: '6px' }}>Họ và Tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-slate-400)' }} />
                  <input
                    type="text"
                    required
                    className="input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="label" style={{ marginBottom: '6px' }}>Email Đăng Nhập</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-slate-400)' }} />
                  <input
                    type="email"
                    required
                    className="input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="label" style={{ marginBottom: '6px' }}>Mật Khẩu Ban Đầu</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-slate-400)' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input"
                    style={{ paddingLeft: '38px' }}
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="label" style={{ marginBottom: '8px' }}>Chọn Vai Trò (Role)</label>
                <div className="role-options-grid">
                  <div 
                    className={`role-option-card ${formData.role === 'STORE_MANAGER' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'STORE_MANAGER' })}
                  >
                    <Store size={20} className="text-emerald" style={{ margin: '0 auto 6px auto' }} />
                    <div className="role-option-title">Quản Lý</div>
                    <div className="role-option-desc">Sản phẩm & Sàn</div>
                  </div>

                  <div 
                    className={`role-option-card ${formData.role === 'CSKH_STAFF' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'CSKH_STAFF' })}
                  >
                    <Headphones size={20} className="text-accent" style={{ margin: '0 auto 6px auto' }} />
                    <div className="role-option-title">CSKH Staff</div>
                    <div className="role-option-desc">Review & Tickets</div>
                  </div>

                  <div 
                    className={`role-option-card ${formData.role === 'ADMIN' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  >
                    <ShieldAlert size={20} style={{ color: '#d97706', margin: '0 auto 6px auto' }} />
                    <div className="role-option-title">Admin</div>
                    <div className="role-option-desc">Toàn quyền hệ thống</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Đang tạo...
                    </>
                  ) : (
                    'Tạo Tài Khoản'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
