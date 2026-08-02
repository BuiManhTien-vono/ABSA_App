import { useAuth } from '../hooks/useAuth';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="settings-container">
      <h2>Cài đặt Tài khoản</h2>

      <div className="settings-card">
        <div className="setting-group">
          <label>Họ và tên</label>
          <input type="text" defaultValue={user?.fullName || ''} readOnly />
        </div>
        <div className="setting-group">
          <label>Email</label>
          <input type="email" defaultValue={user?.email || ''} readOnly />
        </div>
        <div className="setting-group">
          <label>Vai trò</label>
          <input type="text" defaultValue={user?.role || 'OWNER'} readOnly />
        </div>
      </div>
    </div>
  );
}
