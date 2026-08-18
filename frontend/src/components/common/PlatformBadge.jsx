import './PlatformBadge.css';

export default function PlatformBadge({ platform }) {
  const p = (platform || '').toLowerCase();
  const label = p === 'shopee' ? 'Shopee' : p === 'lazada' ? 'Lazada' : p === 'tiktok' ? 'TikTok Shop' : platform;

  return (
    <span className={`platform-badge ${p}`}>
      {label}
    </span>
  );
}
