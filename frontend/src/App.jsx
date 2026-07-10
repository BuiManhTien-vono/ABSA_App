import { useAnalyze } from './hooks/useAnalyze';
import Header from './components/Header';
import ReviewInput from './components/ReviewInput';
import ResultPanel from './components/ResultPanel';
import AspectTable from './components/AspectTable';
import InsightCards from './components/InsightCards';
import JsonViewer from './components/JsonViewer';
import './App.css';

function App() {
  const { result, loading, error, elapsed, analyze, clear } = useAnalyze();

  const statusText = loading
    ? 'Đang phân tích...'
    : error
    ? `Lỗi: ${error}`
    : result
    ? 'Hoàn thành'
    : '';

  return (
    <div className="app">
      <Header status={statusText} elapsed={result ? elapsed : null} />
      <main className="main-layout">
        <aside className="sidebar">
          <ReviewInput onAnalyze={analyze} loading={loading} />
        </aside>
        <section className="content">
          {error && (
            <div className="error-banner animate-fade-in">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {!result && !error && (
            <div className="welcome-state animate-fade-in">
              <div className="welcome-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h2>Nhập review để bắt đầu phân tích</h2>
              <p>Hệ thống sẽ phân tích khía cạnh, cảm xúc, trích bằng chứng và sinh insight tự động.</p>
            </div>
          )}
          {result && (
            <div className="results-stack">
              <ResultPanel result={result} />
              <AspectTable aspects={result.aspect_sentiments} />
              <InsightCards insight={result.insight} />
              <JsonViewer data={result} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
