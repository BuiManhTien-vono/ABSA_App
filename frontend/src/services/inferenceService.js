import apiClient from './apiClient';

export const inferenceService = {
  uploadExcel: (file, saveToDb = true) => {
    const formData = new FormData();
    formData.append('file', file);
    // 120s timeout — model processes ~1 review/sec, max 50 rows
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    return apiClient.post(`/api/v1/inference/upload-excel?saveToDb=${saveToDb}`, formData, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  },
  downloadTemplate: () => {
    return apiClient.get('/api/v1/inference/excel-template', {
      responseType: 'blob',
    });
  },
  predictOne: (text) => apiClient.post('/predict', { text }),
  predictBatch: (texts) => apiClient.post('/predict/batch', { texts }),
};

export default inferenceService;
