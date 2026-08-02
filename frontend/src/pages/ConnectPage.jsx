import { useEffect, useState } from 'react';
import { shopService } from '../services/shopService';
import PlatformBadge from '../components/common/PlatformBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './ConnectPage.css';

const PLATFORMS = [
  { id: 'shopee', name: 'Shopee', desc: 'Kết nối cửa hàng Shopee của bạn' },
  { id: 'lazada', name: 'Lazada', desc: 'Kết nối gian hàng Lazada của bạn' },
  { id: 'tiktok', name: 'TikTok Shop', desc: 'Kết nối TikTok Shop của bạn' },
];

export default function ConnectPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const res = await shopService.getShops();
      setShops(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    try {
      const res = await shopService.getConnectUrl(platform);
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      }
    } catch (err) {
      alert('Không thể khởi tạo OAuth: ' + err.message);
    }
  };

  const handleDisconnect = async (shopId) => {
    if (!confirm('Bạn có chắc chắn muốn ngắt kết nối shop này?')) return;
    try {
      await shopService.disconnectShop(shopId);
      loadShops();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="connect-container">
      <h2>Kết nối Sàn E-commerce</h2>

      <div className="platforms-grid">
        {PLATFORMS.map((p) => {
          const connectedShop = shops.find(
            (s) => s.platform.toLowerCase() === p.id && s.status === 'ACTIVE'
          );

          return (
            <div key={p.id} className="platform-card">
              <div className="platform-info">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>

              {connectedShop ? (
                <div className="status-connected">
                  <span className="shop-name">✓ {connectedShop.shopName}</span>
                  <button
                    onClick={() => handleDisconnect(connectedShop.id)}
                    className="disconnect-btn"
                  >
                    Ngắt kết nối
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(p.id)}
                  className="connect-btn"
                >
                  Kết nối ngay
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
