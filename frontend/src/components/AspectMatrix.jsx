// src/components/AspectMatrix.jsx - ABSA Category & Aspect Matrix Component
import { useState } from 'react';
import { Layers, Package, Truck, Headset, Tag, Filter, X } from 'lucide-react';
import { MICRO_ASPECT_MAP, MACRO_CATEGORY_MAP, getAspectLabel } from '../utils/aspectMapper';
import './AspectMatrix.css';

const MACRO_ICONS = {
  PRODUCT: Package,
  SHIPPING: Truck,
  SERVICE: Headset,
  PRICE: Tag,
  OTHERS: Layers,
};

export default function AspectMatrix({ topAspects = [], selectedAspect, onSelectAspect }) {
  const [selectedMacro, setSelectedMacro] = useState(null);

  // Group top aspects by Macro Category
  const macroGroups = {
    PRODUCT: { total: 0, pos: 0, neu: 0, neg: 0, micros: [] },
    SHIPPING: { total: 0, pos: 0, neu: 0, neg: 0, micros: [] },
    SERVICE: { total: 0, pos: 0, neu: 0, neg: 0, micros: [] },
    PRICE: { total: 0, pos: 0, neu: 0, neg: 0, micros: [] },
  };

  (topAspects || []).forEach((asp) => {
    const microKey = asp.micro_aspect ?? asp.microAspect ?? '';
    const macroKey = asp.macro_category ?? asp.macroCategory ?? MICRO_ASPECT_MAP[microKey]?.macro ?? 'OTHERS';
    const total = asp.total_mentions ?? asp.totalMentions ?? 0;
    const pos = asp.positive_mentions ?? asp.positiveMentions ?? 0;
    const neu = asp.neutral_mentions ?? asp.neutralMentions ?? 0;
    const neg = asp.negative_mentions ?? asp.negativeMentions ?? 0;

    if (macroGroups[macroKey]) {
      macroGroups[macroKey].total += total;
      macroGroups[macroKey].pos += pos;
      macroGroups[macroKey].neu += neu;
      macroGroups[macroKey].neg += neg;
      macroGroups[macroKey].micros.push({ key: microKey, total, pos, neu, neg });
    }
  });

  const displayMicros = selectedMacro
    ? macroGroups[selectedMacro]?.micros || []
    : (topAspects || []).map((a) => {
        const key = a.micro_aspect ?? a.microAspect ?? '';
        return {
          key,
          total: a.total_mentions ?? a.totalMentions ?? 0,
          pos: a.positive_mentions ?? a.positiveMentions ?? 0,
          neu: a.neutral_mentions ?? a.neutralMentions ?? 0,
          neg: a.negative_mentions ?? a.negativeMentions ?? 0,
        };
      });

  return (
    <div className="aspect-matrix-container">
      <div className="aspect-matrix-header">
        <div className="aspect-matrix-title">
          <Layers size={20} className="text-indigo-600" />
          <div>
            <h2>Ma trận Khía cạnh Sản phẩm (ABSA Category Matrix)</h2>
            <p>Mức độ hài lòng & khen/chê bóc tách tự động từ bình luận khách hàng</p>
          </div>
        </div>
        {(selectedMacro || selectedAspect) && (
          <button
            className="aspect-filter-clear"
            type="button"
            onClick={() => {
              setSelectedMacro(null);
              if (onSelectAspect) onSelectAspect(null);
            }}
          >
            <X size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Xóa bộ lọc khía cạnh
          </button>
        )}
      </div>

      <div className="macro-category-grid">
        {Object.entries(MACRO_CATEGORY_MAP).slice(0, 4).map(([macroKey, label]) => {
          const group = macroGroups[macroKey] || { total: 0, pos: 0, neu: 0, neg: 0 };
          const Icon = MACRO_ICONS[macroKey] || Layers;
          const posPct = group.total > 0 ? Math.round((group.pos / group.total) * 100) : 0;
          const negPct = group.total > 0 ? Math.round((group.neg / group.total) * 100) : 0;
          const isSelected = selectedMacro === macroKey;

          return (
            <div
              key={macroKey}
              className={`macro-card ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                const nextMacro = isSelected ? null : macroKey;
                setSelectedMacro(nextMacro);
              }}
            >
              <div className="macro-card-header">
                <span className={`macro-card-icon ${macroKey}`}>
                  <Icon size={16} />
                </span>
                <span className="macro-card-mentions">{group.total} lượt nhắc</span>
              </div>
              <div className="macro-card-title">{label}</div>
              <div className="macro-satisfaction-bar">
                <div className="macro-bar-fill pos" style={{ width: `${posPct}%` }} title={`Tích cực: ${group.pos}`} />
                <div
                  className="macro-bar-fill neu"
                  style={{ width: `${group.total > 0 ? (group.neu / group.total) * 100 : 0}%` }}
                  title={`Trung tính: ${group.neu}`}
                />
                <div className="macro-bar-fill neg" style={{ width: `${negPct}%` }} title={`Tiêu cực: ${group.neg}`} />
              </div>
              <div className="macro-stats-row">
                <span style={{ color: '#10b981', fontWeight: 600 }}>Tích cực: {posPct}%</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Tiêu cực: {negPct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="micro-aspects-section">
        <div className="micro-aspects-title">
          <Filter size={12} style={{ display: 'inline', marginRight: '4px' }} />
          {selectedMacro ? `Khía cạnh chi tiết thuộc nhóm ${MACRO_CATEGORY_MAP[selectedMacro]}` : 'Tất cả các khía cạnh nổi bật (Bấm để lọc bình luận)'}:
        </div>

        <div className="micro-aspect-pills">
          {displayMicros.length > 0 ? (
            displayMicros.map((item) => {
              const label = getAspectLabel(item.key);
              const isActive = selectedAspect === item.key;
              const posPct = item.total > 0 ? Math.round((item.pos / item.total) * 100) : 0;
              const negPct = item.total > 0 ? Math.round((item.neg / item.total) * 100) : 0;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`micro-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    const nextAspect = isActive ? null : item.key;
                    if (onSelectAspect) onSelectAspect(nextAspect);
                  }}
                >
                  <span>{label}</span>
                  <span className={`micro-pill-badge ${posPct >= negPct ? 'pos' : 'neg'}`}>
                    {posPct}% POS
                  </span>
                </button>
              );
            })
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Chưa có dữ liệu khía cạnh chi tiết
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
