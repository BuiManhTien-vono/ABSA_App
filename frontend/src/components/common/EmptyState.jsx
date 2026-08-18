import './EmptyState.css';

export default function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}
