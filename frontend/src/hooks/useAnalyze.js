import { useState, useCallback } from 'react';
import { analyzeText } from '../api/client';

export function useAnalyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(null);

  const analyze = useCallback(async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeText(text);
      setResult(data.result);
      setElapsed(data.elapsed_ms);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setElapsed(null);
  }, []);

  return { result, loading, error, elapsed, analyze, clear };
}
