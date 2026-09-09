// src/utils/aspectMapper.js - Aspect taxonomy Vietnamese translation map

export const MICRO_ASPECT_MAP = {
  Appearance_Design: { label: 'Kiểu dáng & Mẫu mã', macro: 'PRODUCT', category: 'Sản phẩm' },
  Material_BuildQuality: { label: 'Chất liệu & Độ bền', macro: 'PRODUCT', category: 'Sản phẩm' },
  Performance_Functionality: { label: 'Hiệu năng & Chức năng', macro: 'PRODUCT', category: 'Sản phẩm' },
  Usability_Experience: { label: 'Trải nghiệm sử dụng', macro: 'PRODUCT', category: 'Sản phẩm' },
  Authenticity_Packaging: { label: 'Chính hãng & Tem nhãn', macro: 'PRODUCT', category: 'Sản phẩm' },
  
  Delivery_Speed: { label: 'Tốc độ giao hàng', macro: 'SHIPPING', category: 'Vận chuyển' },
  External_Packaging: { label: 'Đóng gói hàng', macro: 'SHIPPING', category: 'Vận chuyển' },
  Courier_Attitude: { label: 'Thái độ Shipper', macro: 'SHIPPING', category: 'Vận chuyển' },
  Shipping_Fee: { label: 'Phí vận chuyển', macro: 'SHIPPING', category: 'Vận chuyển' },

  Response_Time: { label: 'Tốc độ phản hồi Shop', macro: 'SERVICE', category: 'Dịch vụ CSKH' },
  Consulting_Attitude: { label: 'Thái độ tư vấn Shop', macro: 'SERVICE', category: 'Dịch vụ CSKH' },
  AfterSales_Complaint: { label: 'Xử lý bảo hành & Đổi trả', macro: 'SERVICE', category: 'Dịch vụ CSKH' },

  Price_Promotion: { label: 'Giá bán & Khuyến mãi', macro: 'PRICE', category: 'Giá cả' },
  Price_Performance_Ratio: { label: 'Mức độ đáng tiền (P/P)', macro: 'PRICE', category: 'Giá cả' },

  Overall_Sentiment: { label: 'Đánh giá chung', macro: 'OTHERS', category: 'Khác' },
  Spam_Noise: { label: 'Nội dung nhiễu', macro: 'OTHERS', category: 'Khác' },
  Intent_QA: { label: 'Ý định mua hàng', macro: 'OTHERS', category: 'Khác' },
};

export const MACRO_CATEGORY_MAP = {
  PRODUCT: 'Sản phẩm',
  SHIPPING: 'Vận chuyển',
  SERVICE: 'Dịch vụ CSKH',
  PRICE: 'Giá cả & P/P',
  OTHERS: 'Khác',
};

export function getAspectLabel(microKey) {
  if (!microKey) return 'Khía cạnh khác';
  return MICRO_ASPECT_MAP[microKey]?.label || microKey;
}

export function getMacroLabel(macroKey) {
  if (!macroKey) return 'Khác';
  return MACRO_CATEGORY_MAP[macroKey] || macroKey;
}

export default {
  MICRO_ASPECT_MAP,
  MACRO_CATEGORY_MAP,
  getAspectLabel,
  getMacroLabel,
};
