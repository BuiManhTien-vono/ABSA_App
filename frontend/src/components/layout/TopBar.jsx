import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Search } from 'lucide-react';
import './TopBar.css';

const PLATFORMS = [
  { name: 'Shopee', tone: 'shopee' },
  { name: 'Lazada', tone: 'lazada' },
  { name: 'TikTok Shop', tone: 'tiktok' },
];

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('7');
  const [activePlatforms, setActivePlatforms] = useState(() => PLATFORMS.map((item) => item.name));

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/products?search=${encodeURIComponent(trimmedQuery)}` : '/products');
  };

  const togglePlatform = (platform) => {
    setActivePlatforms((current) => (
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    ));
  };

  return (
    <header className="topbar-container">
      <div className="topbar-tools">
        <form className="topbar-search" onSubmit={handleSearch} role="search">
          <Search size={13} strokeWidth={1.8} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm sản phẩm, đánh giá..."
            aria-label="Tìm sản phẩm hoặc đánh giá"
          />
        </form>

        <div className="topbar-actions">
          <div className="topbar-platforms" role="group" aria-label="Lọc theo sàn">
            {PLATFORMS.map((platform) => {
              const isActive = activePlatforms.includes(platform.name);
              return (
                <button
                  key={platform.name}
                  className={`topbar-platform topbar-platform--${platform.tone}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => togglePlatform(platform.name)}
                >
                  <span />
                  {platform.name}
                </button>
              );
            })}
          </div>

          <label className="topbar-period">
            <CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Khoảng thời gian"
            >
              <option value="7">7 ngày</option>
              <option value="30">30 ngày</option>
              <option value="90">90 ngày</option>
            </select>
          </label>

          <Link className="topbar-notification" to="/notifications" aria-label="Thông báo" title="Thông báo">
            <Bell size={16} strokeWidth={1.8} />
            <span>3</span>
          </Link>
        </div>
      </div>

      <div className="topbar-title-row">
        <h1 className="topbar-title">{title || 'Dashboard'}</h1>
      </div>
    </header>
  );
}
