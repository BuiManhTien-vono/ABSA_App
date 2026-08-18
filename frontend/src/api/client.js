const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function getAuthHeaders() {
  const token = localStorage.getItem('absa_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function analyzeText(text, options = {}) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, ...options }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function analyzeBatch(texts, options = {}) {
  const response = await fetch(`${API_BASE}/predict/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ texts, ...options }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`, {
    headers: getAuthHeaders(),
  });
  return response.json();
}
