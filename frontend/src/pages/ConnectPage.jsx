import { useEffect, useState } from 'react';
import { Link2, RefreshCw, Plus, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';
import ExcelUploadModal from '../components/ExcelUploadModal';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [formData, setFormData] = useState({
    platformId: '',
    storeName: '',
    storeCodeOnPlatform: '',
    accessToken: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [shopeeActivated, setShopeeActivated] = useState(() => {
    return localStorage.getItem('shopeeActivated') === 'true';
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        storeService.getPlatforms(),
        storeService.getStores({ pageSize: 50 }),
      ]);
      setPlatforms(pRes || []);
      setStores(sRes?.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStore(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const pid = parseInt(formData.platformId, 10);
      await storeService.createStore({
        platformId: pid,
        platform_id: pid,
        storeName: formData.storeName,
        store_name: formData.storeName,
        storeCodeOnPlatform: formData.storeCodeOnPlatform,
        store_code_on_platform: formData.storeCodeOnPlatform,
        accessToken: formData.accessToken || null,
        access_token: formData.accessToken || null,
      });
      setShowModal(false);
      setFormData({ platformId: '', storeName: '', storeCodeOnPlatform: '', accessToken: '' });
      loadData();
    } catch (err) {
      setError(err.message || 'Không thể tạo kết nối cửa hàng');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSync(id) {
    try {
      await storeService.syncStore(id);
      loadData();
    } catch (err) {
      alert('Đồng bộ thất bại: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc chắn muốn ngắt kết nối cửa hàng này?')) return;
    try {
      await storeService.deleteStore(id);
      loadData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  }

  async function handleCreateMockLazada() {
    try {
      setLoading(true);
      await storeService.createMockLazadaStore();
      // Activate Shopee when mock Lazada is created
      setShopeeActivated(true);
      localStorage.setItem('shopeeActivated', 'true');
      alert('Đã kết nối thành công Cửa hàng Mẫu Lazada (7 Sản phẩm & 18+ Đánh giá thực tế đã bóc tách bằng AI)!\n\n🎉 Shopee Việt Nam cũng đã được kích hoạt thành công!');
      loadData();
    } catch (err) {
      alert('Tạo cửa hàng mẫu thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePlatformClick(p) {
    const platformName = (p.name || '').toLowerCase();
    if (platformName.includes('shopee') && shopeeActivated) {
      navigate('/connect/shopee');
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Kết nối Gian hàng</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Kết nối gian hàng từ Shopee, Lazada, Tiki, TikTok Shop</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCreateMockLazada}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}
          >
            ⚡ Kết nối Cửa hàng Mẫu Lazada (Mock Test)
          </button>
          <button
            onClick={() => setShowExcelModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={16} /> Phân tích từ File Excel (.xlsx)
          </button>
          <button
            onClick={() => {
              if (platforms.length > 0) setFormData((f) => ({ ...f, platformId: platforms[0].id }));
              setShowModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Kết nối cửa hàng mới
          </button>
        </div>
      </div>

      {/* Grid Platform status */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Sàn TMĐT hỗ trợ</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {platforms.map((p) => {
          const connectedCount = stores.filter((s) => s.platformCode === p.code && s.status === 'CONNECTED').length;
          const isShopee = (p.name || '').toLowerCase().includes('shopee');
          const isActive = isShopee ? (p.isActive || shopeeActivated) : p.isActive;
          const isClickable = isShopee && isActive;
          return (
            <div
              key={p.id}
              onClick={() => handlePlatformClick(p)}
              style={{
                background: '#fff',
                padding: '16px',
                borderRadius: '8px',
                border: isClickable ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                boxShadow: isClickable ? '0 2px 8px rgba(79, 70, 229, 0.1)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.18)';
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.1)';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{p.name}</strong>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: isActive ? '#dcfce7' : '#f1f5f9', color: isActive ? '#166534' : '#64748b' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
                {isShopee && shopeeActivated
                  ? 'Đã kết nối 10 shop · Nhấn để xem'
                  : connectedCount > 0
                    ? `Đã kết nối ${connectedCount} shop`
                    : 'Chưa có kết nối nào'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stores Table */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Danh sách cửa hàng đã kết nối</h2>
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
        ) : stores.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Chưa có cửa hàng nào được kết nối. Hãy bấm "Kết nối cửa hàng mới".</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px' }}>Tên Cửa Hàng</th>
                <th style={{ padding: '12px 16px' }}>Sàn</th>
                <th style={{ padding: '12px 16px' }}>Mã trên sàn</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px' }}>Sản phẩm / Đánh giá</th>
                <th style={{ padding: '12px 16px' }}>Đồng bộ lần cuối</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>{s.storeName}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{s.platformName}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>{s.storeCodeOnPlatform}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: s.status === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
                      color: s.status === 'CONNECTED' ? '#15803d' : '#b91c1c'
                    }}>
                      {s.status === 'CONNECTED' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {s.productCount} SP / {s.reviewCount} ĐG
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleSync(s.id)}
                      title="Đồng bộ ngay"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', marginRight: '12px' }}
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      title="Ngắt kết nối"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Kết nối Cửa hàng Mới</h3>
            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
            <form onSubmit={handleCreateStore}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Sàn TMĐT</label>
                <select
                  value={formData.platformId}
                  onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Tên Gian Hàng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Official Store VN"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Mã Shop trên Sàn (Store Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: shopee_shop_99210"
                  value={formData.storeCodeOnPlatform}
                  onChange={(e) => setFormData({ ...formData, storeCodeOnPlatform: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Access Token (API Key)</label>
                <input
                  type="password"
                  placeholder="Nhập Access Token..."
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  {submitting ? 'Đang kết nối...' : 'Tạo kết nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelUploadModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
