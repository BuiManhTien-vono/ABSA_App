import { useState } from 'react';
import { Download, FileSpreadsheet, Sparkles, UploadCloud, X } from 'lucide-react';
import inferenceService from '../services/inferenceService';
import { getAspectLabel, getMacroLabel } from '../utils/aspectMapper';
import './ExcelUploadModal.css';

export default function ExcelUploadModal({ isOpen, onClose, onSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setError('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await inferenceService.uploadExcel(file, true);
      setResult(response);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      console.error('Lỗi phân tích Excel:', err);
      const detail = err.response?.data?.detail || 'Không thể đọc và phân tích file Excel. Vui lòng kiểm tra định dạng.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await inferenceService.downloadTemplate();
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mau_Danh_Gia_San_Pham.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi tải file mẫu:', err);
    }
  };

  return (
    <div className="excel-modal-backdrop" onClick={onClose}>
      <div className="excel-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="excel-modal-header">
          <div className="excel-modal-title">
            <Sparkles size={20} className="text-indigo-600" />
            <div>
              <h3>Phân tích Đánh giá từ File Excel</h3>
              <p>Tải file Excel/CSV chứa bình luận để AI ViSoBERT phân tích cảm xúc & khía cạnh</p>
            </div>
          </div>
          <button className="excel-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="excel-modal-body">
          {loading ? (
            <div className="excel-progress-container">
              <div className="excel-spinner" />
              <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.05rem' }}>
                Đang nạp AI & phân tích dữ liệu...
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Mô hình ViSoBERT đang nhận diện cảm xúc & trích xuất khía cạnh.<br/>
                Quá trình này có thể mất 30-60 giây tùy số lượng bình luận.
              </p>
            </div>
          ) : result ? (
            <div>
              <div className="excel-result-summary">
                <div className="excel-stat-box">
                  <label>Tổng bình luận</label>
                  <strong>{result.processed_rows ?? result.processedRows ?? result.total_rows ?? result.totalRows ?? 0}</strong>
                </div>
                <div className="excel-stat-box pos">
                  <label>Tích cực (POS)</label>
                  <strong>{result.positive_count ?? result.positiveCount ?? 0} ({result.positive_percentage ?? result.positivePercentage ?? 0}%)</strong>
                </div>
                <div className="excel-stat-box neu">
                  <label>Trung tính (NEU)</label>
                  <strong>{result.neutral_count ?? result.neutralCount ?? 0} ({result.neutral_percentage ?? result.neutralPercentage ?? 0}%)</strong>
                </div>
                <div className="excel-stat-box neg">
                  <label>Tiêu cực (NEG)</label>
                  <strong>{result.negative_count ?? result.negativeCount ?? 0} ({result.negative_percentage ?? result.negativePercentage ?? 0}%)</strong>
                </div>
              </div>

              {/* Aspect Breakdown Highlights */}
              {(result.top_aspects || result.topAspects || []).length > 0 && (
                <div className="excel-aspects-section">
                  <div className="excel-aspects-title">
                    <Sparkles size={16} className="text-amber-500" />
                    Thống kê khía cạnh sản phẩm bóc tách bằng AI (ViSoBERT ABSA):
                  </div>
                  <div className="excel-aspect-grid">
                    {(result.top_aspects || result.topAspects || []).slice(0, 6).map((asp, idx) => {
                      const microKey = asp.micro_aspect ?? asp.microAspect ?? '';
                      const label = getAspectLabel(microKey);
                      const totalMentions = asp.total_mentions ?? asp.totalMentions ?? 0;
                      const posMentions = asp.positive_mentions ?? asp.positiveMentions ?? 0;
                      const neuMentions = asp.neutral_mentions ?? asp.neutralMentions ?? 0;
                      const negMentions = asp.negative_mentions ?? asp.negativeMentions ?? 0;
                      const posWidth = totalMentions > 0 ? (posMentions / totalMentions) * 100 : 0;
                      const neuWidth = totalMentions > 0 ? (neuMentions / totalMentions) * 100 : 0;
                      const negWidth = totalMentions > 0 ? (negMentions / totalMentions) * 100 : 0;

                      return (
                        <div className="excel-aspect-card" key={microKey || idx}>
                          <div className="excel-aspect-header">
                            <span className="excel-aspect-name">{label}</span>
                            <span className="excel-aspect-count">{totalMentions} nhắc đến</span>
                          </div>
                          <div className="excel-aspect-bar">
                            <div className="excel-aspect-bar-fill pos" style={{ width: `${posWidth}%` }} title={`Tích cực: ${posMentions}`} />
                            <div className="excel-aspect-bar-fill neu" style={{ width: `${neuWidth}%` }} title={`Trung tính: ${neuMentions}`} />
                            <div className="excel-aspect-bar-fill neg" style={{ width: `${negWidth}%` }} title={`Tiêu cực: ${negMentions}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}>
                Danh sách đánh giá & Khía cạnh bóc tách bởi AI:
              </h4>

              <div className="excel-table-container">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sản phẩm</th>
                      <th>Khách hàng</th>
                      <th>Nội dung bình luận</th>
                      <th>Cảm xúc</th>
                      <th>Khía cạnh & Cảm xúc (AI ABSA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.reviews || []).map((row, idx) => {
                      const sentimentStr = (row?.overall_sentiment ?? row?.overallSentiment ?? 'POS').toUpperCase();
                      const sentimentClass = sentimentStr.toLowerCase();
                      const sentimentText = sentimentStr === 'POS' ? 'Tích cực' :
                                            sentimentStr === 'NEU' ? 'Trung tính' : 'Tiêu cực';
                      const prodName = row?.product_name ?? row?.productName ?? 'Sản phẩm mẫu';
                      const custName = row?.customer_name ?? row?.customerName ?? 'Khách hàng';
                      const comment = row?.comment_text ?? row?.commentText ?? '';
                      const aspectList = row?.aspect_sentiments ?? row?.aspectSentiments ?? [];

                      // Filter out generic overall sentiment & spam noise for explicit aspect tags
                      const filteredAspects = aspectList.filter(
                        (a) => (a.micro ?? a.Micro) !== 'Overall_Sentiment' && (a.micro ?? a.Micro) !== 'Spam_Noise'
                      );

                      return (
                        <tr key={row?.row_index ?? row?.rowIndex ?? idx}>
                          <td>{row?.row_index ?? row?.rowIndex ?? (idx + 1)}</td>
                          <td>{prodName}</td>
                          <td>{custName}</td>
                          <td style={{ maxWidth: '220px', wordBreak: 'break-word' }}>{comment}</td>
                          <td>
                            <span className={`excel-badge ${sentimentClass}`}>
                              {sentimentText}
                            </span>
                          </td>
                          <td style={{ maxWidth: '260px' }}>
                            {filteredAspects.length > 0 ? (
                              <div className="aspect-tag-list">
                                {filteredAspects.map((asp, aIdx) => {
                                  const microKey = asp.micro ?? asp.Micro ?? '';
                                  const sVal = (asp.sentiment ?? asp.Sentiment ?? 'POS').toUpperCase();
                                  const sClass = sVal.toLowerCase();
                                  const label = getAspectLabel(microKey);

                                  return (
                                    <span className={`aspect-tag ${sClass}`} key={aIdx} title={`${label} (${sVal})`}>
                                      {label}: {sVal === 'POS' ? 'Tích cực' : sVal === 'NEU' ? 'Trung tính' : 'Tiêu cực'}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', italic: 'true' }}>
                                (Đánh giá chung)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={`excel-dropzone ${isDragging ? 'is-dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('excel-file-input').click()}
              >
                <input
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                />
                <div className="excel-dropzone-icon">
                  <UploadCloud size={24} />
                </div>
                <h4>Kéo & thả file Excel vào đây, hoặc bấm để chọn file</h4>
                <p>Hỗ trợ định dạng: .xlsx, .xls, .csv (Tự động giới hạn tối đa 50 bình luận)</p>

                <div className="excel-actions-row" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="excel-download-sample-btn"
                    type="button"
                    onClick={handleDownloadSample}
                  >
                    <Download size={14} />
                    Tải File Excel Mẫu (.csv)
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="excel-modal-footer">
          {result ? (
            <button
              className="excel-primary-btn"
              onClick={() => {
                if (onSuccess) onSuccess(result);
                onClose();
              }}
              type="button"
            >
              Cập nhật Dashboard Trang chủ
            </button>
          ) : (
            <button className="excel-download-sample-btn" onClick={onClose} type="button">
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
