import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Plus, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet, X, ChevronRight, Zap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';
import ExcelUploadModal from '../components/ExcelUploadModal';
import { SHOPEE_STORES } from '../data/shopeeData';
import { LAZADA_STORES } from '../data/lazadaData';

const MOCK_STORES_BY_PLATFORM = {
  shopee: SHOPEE_STORES,
  lazada: LAZADA_STORES,
};

// Helper: read/write connected platforms from localStorage
function getConnectedPlatforms() {
  try {
    const data = JSON.parse(localStorage.getItem('connectedPlatforms') || '{}');
    let migrated = false;
    Object.entries(data).forEach(([platformCode, connection]) => {
      const platformStores = MOCK_STORES_BY_PLATFORM[platformCode] || [];
      if (connection?.connected && Array.isArray(connection.stores) && connection.stores.length === 0 && platformStores.length) {
        connection.stores = platformStores.map((store) => store.id);
        migrated = true;
      }
    });
    if (migrated) localStorage.setItem('connectedPlatforms', JSON.stringify(data));
    return data;
  } catch { return {}; }
}
function saveConnectedPlatforms(data) {
  localStorage.setItem('connectedPlatforms', JSON.stringify(data));
}

// Platform definitions with mock store sources
const PLATFORM_DEFS = [
  {
    code: 'shopee',
    name: 'Shopee Việt Nam',
    icon: '🛒',
    color: '#ee4d2d',
    gradient: 'linear-gradient(135deg, #ee4d2d, #ff6633)',
    description: 'Kết nối cửa hàng Shopee để phân tích đánh giá sản phẩm bằng AI',
    getStores: () => SHOPEE_STORES,
  },
  {
    code: 'lazada',
    name: 'Lazada Việt Nam',
    icon: '🏪',
    color: '#0f146d',
    gradient: 'linear-gradient(135deg, #0f146d, #2b31a6)',
    description: 'Kết nối cửa hàng Lazada để theo dõi cảm xúc khách hàng theo khía cạnh',
    getStores: () => LAZADA_STORES,
  },
];

// Tiki and TikTok Shop are selectable UI options only. Their store lists will
// come from the integration flow later, so no product/store mock is created.
const MODAL_PLATFORM_DEFS = [
  ...PLATFORM_DEFS,
  {
    code: 'tiki',
    name: 'Tiki Việt Nam',
    icon: '📘',
    color: '#0b74e5',
    gradient: 'linear-gradient(135deg, #0b74e5, #35a7ff)',
    description: 'Chọn Tiki để tiếp tục thiết lập kết nối',
    getStores: () => [],
  },
  {
    code: 'tiktok-shop',
    name: 'TikTok Shop Việt Nam',
    icon: '🎵',
    color: '#111827',
    gradient: 'linear-gradient(135deg, #111827, #374151)',
    description: 'Chọn TikTok Shop để tiếp tục thiết lập kết nối',
    getStores: () => [],
  },
];

export default function ConnectPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [formData, setFormData] = useState({
    platformId: '',
    storeName: '',
    storeCodeOnPlatform: '',
    accessToken: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Platform connection modal state
  const [modalStep, setModalStep] = useState(1); // 1=choose platform, 2=choose stores
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState(getConnectedPlatforms);

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

  // Platform connection modal handlers
  function openPlatformModal() {
    setModalStep(1);
    setSelectedPlatform(null);
    setSelectedStoreIds([]);
    setStoreSearch('');
    setShowPlatformModal(true);
  }

  function selectPlatform(platform) {
    setSelectedPlatform(platform);
    setSelectedStoreIds([]);
    setStoreSearch('');
    setModalStep(2);
  }

  function toggleStoreSelection(storeId) {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
    );
  }

  function toggleSelectAll(allStores) {
    if (selectedStoreIds.length === allStores.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(allStores.map((s) => s.id));
    }
  }

  function handleConnectPlatform() {
    if (!selectedPlatform) return;
    setConnecting(true);

    // Simulate connection delay
    setTimeout(() => {
      const allStores = selectedPlatform.getStores();
      const storeIdsToConnect = selectedStoreIds.length === 0
        ? allStores.map((s) => s.id) // Connect all if none selected
        : selectedStoreIds;

      const updated = {
        ...connectedPlatforms,
        [selectedPlatform.code]: {
          connected: true,
          connectedAt: new Date().toISOString(),
          stores: storeIdsToConnect,
        },
      };
      saveConnectedPlatforms(updated);
      setConnectedPlatforms(updated);

      // Also set shopeeActivated for backward compatibility
      if (selectedPlatform.code === 'shopee') {
        localStorage.setItem('shopeeActivated', 'true');
      }

      setConnecting(false);
      setShowPlatformModal(false);
      alert(`✅ Đã kết nối thành công ${storeIdsToConnect.length} cửa hàng trên ${selectedPlatform.name}!`);
    }, 1200);
  }

  function handleDisconnectPlatform(platformCode) {
    if (!confirm(`Bạn có chắc muốn ngắt kết nối tất cả cửa hàng trên sàn này?`)) return;
    const updated = { ...connectedPlatforms };
    delete updated[platformCode];
    saveConnectedPlatforms(updated);
    setConnectedPlatforms(updated);
    if (platformCode === 'shopee') {
      localStorage.removeItem('shopeeActivated');
    }
  }

  function handlePlatformCardClick(platformDef) {
    const conn = connectedPlatforms[platformDef.code];
    if (conn?.connected) {
      navigate(`/products/${platformDef.code}`);
    }
  }

  function getConnectedStoreCount(platformCode) {
    const conn = connectedPlatforms[platformCode];
    if (!conn?.connected) return 0;
    return Array.isArray(conn.stores) ? conn.stores.length : 0;
  }

  // Available mock stores for modal step 2
  const availableStores = useMemo(() => {
    if (!selectedPlatform) return [];
    const all = selectedPlatform.getStores();
    if (!storeSearch.trim()) return all;
    const q = storeSearch.toLowerCase();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
    );
  }, [selectedPlatform, storeSearch]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Quản lý Kết nối Gian hàng</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Kết nối gian hàng từ Shopee, Lazada, Tiki, TikTok Shop</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={openPlatformModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)'; }}
          >
            <Zap size={16} /> Kết nối sàn TMĐT
          </button>
          <button
            onClick={() => setShowExcelModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#10b981', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer',
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
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#64748b', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '8px 16px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Kết nối thủ công (API)
          </button>
        </div>
      </div>

      {/* Platform Cards */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Sàn TMĐT đã kết nối</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {PLATFORM_DEFS.map((pDef) => {
          const conn = connectedPlatforms[pDef.code];
          const isConnected = conn?.connected;
          const storeCount = getConnectedStoreCount(pDef.code);

          return (
            <div
              key={pDef.code}
              onClick={() => handlePlatformCardClick(pDef)}
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '12px',
                border: isConnected ? `2px solid ${pDef.color}` : '1px solid #e2e8f0',
                cursor: isConnected ? 'pointer' : 'default',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isConnected ? `0 4px 16px ${pDef.color}18` : '0 1px 3px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (isConnected) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${pDef.color}25`;
                }
              }}
              onMouseLeave={(e) => {
                if (isConnected) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${pDef.color}18`;
                }
              }}
            >
              {/* Decorative gradient bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: isConnected ? pDef.gradient : '#e2e8f0',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: isConnected ? pDef.gradient : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: isConnected ? `0 4px 12px ${pDef.color}30` : 'none',
                  }}>
                    {pDef.icon}
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{pDef.name}</strong>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                      background: isConnected ? '#dcfce7' : '#f1f5f9',
                      color: isConnected ? '#166534' : '#64748b',
                      fontWeight: 500,
                    }}>
                      {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                    </span>
                  </div>
                </div>
                {isConnected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDisconnectPlatform(pDef.code); }}
                    title="Ngắt kết nối sàn"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94a3b8', padding: '4px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                {isConnected ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: pDef.color }}>{storeCount}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>cửa hàng liên kết</div>
                    </div>
                    <span style={{
                      fontSize: '12px', color: pDef.color, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      Xem sản phẩm <ChevronRight size={14} />
                    </span>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    {pDef.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Backend API stores (from platforms endpoint) */}
        {platforms
          .filter((p) => {
            const name = (p.name || '').toLowerCase();
            return !name.includes('shopee') && !name.includes('lazada');
          })
          .map((p) => {
            const connectedCount = stores.filter((s) => s.platformCode === p.code && s.status === 'CONNECTED').length;
            return (
              <div key={p.id} style={{
                background: '#fff', padding: '20px', borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>🏬</div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{p.name}</strong>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px',
                      background: p.isActive ? '#dcfce7' : '#f1f5f9',
                      color: p.isActive ? '#166534' : '#64748b',
                    }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', marginBottom: 0 }}>
                  {connectedCount > 0 ? `Đã kết nối ${connectedCount} shop` : 'Chưa có kết nối nào'}
                </p>
              </div>
            );
          })}
      </div>

      {/* Backend Stores Table */}
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>Cửa hàng đã kết nối qua API</h2>
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
        ) : stores.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Chưa có cửa hàng nào được kết nối qua API.</div>
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
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                      background: s.status === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
                      color: s.status === 'CONNECTED' ? '#15803d' : '#b91c1c',
                    }}>
                      {s.status === 'CONNECTED' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.productCount} SP / {s.reviewCount} ĐG</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString('vi-VN') : 'Chưa đồng bộ'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleSync(s.id)} title="Đồng bộ ngay"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', marginRight: '12px' }}>
                      <RefreshCw size={15} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} title="Ngắt kết nối"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== PLATFORM CONNECTION MODAL ===== */}
      {showPlatformModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}
          onClick={() => !connecting && setShowPlatformModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px', width: '100%',
              maxWidth: modalStep === 1 ? '520px' : '640px',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
              transition: 'max-width 0.3s ease',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  {modalStep === 1 ? '⚡ Kết nối sàn TMĐT' : `Chọn cửa hàng — ${selectedPlatform?.name}`}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {modalStep === 1
                    ? 'Chọn sàn thương mại điện tử bạn muốn kết nối'
                    : 'Chọn cửa hàng cụ thể hoặc bỏ qua để kết nối tất cả'}
                </p>
              </div>
              <button
                onClick={() => !connecting && setShowPlatformModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {modalStep === 1 ? (
                /* Step 1: Choose Platform */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {MODAL_PLATFORM_DEFS.map((pDef) => {
                    const alreadyConnected = connectedPlatforms[pDef.code]?.connected;
                    return (
                      <button
                        key={pDef.code}
                        onClick={() => !alreadyConnected && selectPlatform(pDef)}
                        disabled={alreadyConnected}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '18px 20px', borderRadius: '12px',
                          border: alreadyConnected ? '1px solid #e2e8f0' : '2px solid #e2e8f0',
                          background: alreadyConnected ? '#f8fafc' : '#fff',
                          cursor: alreadyConnected ? 'not-allowed' : 'pointer',
                          textAlign: 'left', transition: 'all 0.2s ease',
                          opacity: alreadyConnected ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!alreadyConnected) {
                            e.currentTarget.style.borderColor = pDef.color;
                            e.currentTarget.style.boxShadow = `0 4px 16px ${pDef.color}15`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!alreadyConnected) {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '14px',
                          background: pDef.gradient,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '26px', flexShrink: 0,
                          boxShadow: `0 4px 12px ${pDef.color}30`,
                        }}>
                          {pDef.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                            {pDef.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {alreadyConnected
                              ? `✅ Đã kết nối ${getConnectedStoreCount(pDef.code)} cửa hàng`
                              : pDef.description}
                          </div>
                        </div>
                        {!alreadyConnected && (
                          <ChevronRight size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Step 2: Choose Stores */
                <div>
                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Tìm cửa hàng theo tên, mã, ngành hàng..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                      }}
                    />
                  </div>

                  {/* Select All */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '12px', padding: '8px 12px',
                    background: '#f8fafc', borderRadius: '8px',
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={selectedStoreIds.length === availableStores.length && availableStores.length > 0}
                        onChange={() => toggleSelectAll(availableStores)}
                        style={{ width: '16px', height: '16px', accentColor: selectedPlatform?.color }}
                      />
                      Chọn tất cả ({availableStores.length} cửa hàng)
                    </label>
                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 500 }}>
                      Đã chọn: {selectedStoreIds.length}
                    </span>
                  </div>

                  {/* Store List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                    {availableStores.map((s) => {
                      const isSelected = selectedStoreIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 14px', borderRadius: '10px',
                            border: isSelected ? `2px solid ${selectedPlatform?.color}` : '1px solid #e2e8f0',
                            background: isSelected ? `${selectedPlatform?.color}08` : '#fff',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStoreSelection(s.id)}
                            style={{ width: '16px', height: '16px', accentColor: selectedPlatform?.color, flexShrink: 0 }}
                          />
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: '#f0f4ff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                          }}>
                            {s.avatar}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {s.category} · ⭐ {s.rating} · {s.reviewCount?.toLocaleString()} đánh giá
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {availableStores.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      Sàn này chưa có danh sách cửa hàng. Bạn có thể quay lại và chọn sàn khác.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                {modalStep === 2 && (
                  <button
                    onClick={() => setModalStep(1)}
                    disabled={connecting}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                      background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#475569',
                    }}
                  >
                    ← Quay lại
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => !connecting && setShowPlatformModal(false)}
                  disabled={connecting}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#475569',
                  }}
                >
                  Hủy
                </button>
                {modalStep === 2 && (
                  <button
                    onClick={handleConnectPlatform}
                    disabled={connecting || availableStores.length === 0}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', border: 'none',
                      background: selectedPlatform?.gradient || '#4f46e5',
                      color: '#fff', fontSize: '13px', fontWeight: 600,
                      opacity: connecting || availableStores.length === 0 ? 0.5 : 1,
                      cursor: connecting || availableStores.length === 0 ? 'not-allowed' : 'pointer',
                      boxShadow: `0 4px 12px ${selectedPlatform?.color || '#4f46e5'}30`,
                    }}
                  >
                    {connecting
                      ? '⏳ Đang kết nối...'
                      : selectedStoreIds.length === 0
                        ? `Kết nối tất cả (${availableStores.length} shop)`
                        : `Kết nối ${selectedStoreIds.length} cửa hàng`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Store Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Kết nối Cửa hàng (API)</h3>
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
                <input type="text" required placeholder="VD: Official Store VN" value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Mã Shop trên Sàn</label>
                <input type="text" required placeholder="VD: shopee_shop_99210" value={formData.storeCodeOnPlatform}
                  onChange={(e) => setFormData({ ...formData, storeCodeOnPlatform: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Access Token (API Key)</label>
                <input type="password" placeholder="Nhập Access Token..." value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
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
        onSuccess={() => { loadData(); }}
      />
    </div>
  );
}
