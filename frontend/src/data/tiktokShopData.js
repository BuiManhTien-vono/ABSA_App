// Independent TikTok Shop mock catalog: 6 shops x 12 products.
const SHOP_SEEDS = [
  ['tts-01', 'Mộc Nhiên Official', 'TTS_MOC_NHIEN', 'Mỹ phẩm thiên nhiên', '🌿', 4.8, 18600],
  ['tts-02', 'Góc Nhà Gen Z', 'TTS_GOC_NHA', 'Gia dụng', '🏠', 4.7, 12400],
  ['tts-03', 'TechTok Hub', 'TTS_TECHTOK', 'Điện tử', '🎧', 4.9, 28700],
  ['tts-04', 'Lala Baby Store', 'TTS_LALA_BABY', 'Mẹ & Bé', '🧸', 4.8, 15300],
  ['tts-05', 'Streetwear Daily', 'TTS_STREETWEAR', 'Thời trang', '👟', 4.6, 21900],
  ['tts-06', 'Bếp Vui Mỗi Ngày', 'TTS_BEP_VUI', 'Nhà bếp', '🍳', 4.7, 9800],
];
const PRODUCT_SEEDS = [
  ['Áo khoác chống nắng dáng rộng', 'Thời trang', 189000], ['Bình giữ nhiệt nắp bật 600ml', 'Gia dụng', 129000],
  ['Đèn ngủ cảm biến ánh sáng', 'Đồ dùng nhà', 99000], ['Tai nghe Bluetooth âm thanh nổi', 'Điện tử', 259000],
  ['Set 5 khăn lau đa năng', 'Đồ dùng nhà', 69000], ['Túi tote canvas phong cách Hàn', 'Phụ kiện', 79000],
  ['Máy massage mini cầm tay', 'Chăm sóc cá nhân', 219000], ['Hộp cơm giữ nhiệt 2 tầng', 'Nhà bếp', 179000],
  ['Bộ sticker trang trí journal', 'Văn phòng phẩm', 45000], ['Kệ để điện thoại gấp gọn', 'Phụ kiện', 59000],
  ['Nước hoa sáp hương trà trắng', 'Làm đẹp', 149000], ['Gối cổ memory foam du lịch', 'Đời sống', 159000],
];
export const TIKTOK_SHOP_STORES = SHOP_SEEDS.map(([id, name, code, category, avatar, rating, followers], index) => ({
  id, name, code, category, avatar, rating, followers, status: 'CONNECTED', reviewCount: 860 + index * 417,
  revenue: `${(0.62 + index * 0.31).toFixed(2)} tỷ`, connectedAt: `2026-09-${String(2 + index).padStart(2, '0')}T10:00:00`,
  description: `Cửa hàng TikTok Shop chuyên ${category.toLowerCase()}, nội dung livestream được yêu thích.`,
}));
function productsForStore(store, storeIndex) { return PRODUCT_SEEDS.map(([name, category, basePrice], index) => ({
  id: `tts-${storeIndex + 1}-${String(index + 1).padStart(2, '0')}`, storeId: store.id, storeName: store.name,
  name: `${name} — ${store.name.split(' ')[0]}`, sku: `${store.code}-${String(index + 1).padStart(3, '0')}`,
  categoryName: category, categoryId: `tts-cat-${storeIndex}-${PRODUCT_SEEDS.findIndex(([, name]) => name === category)}`,
  storeBadge: `TikTok Shop Mall - ${store.name}`, price: basePrice + storeIndex * 17000 + index * 9000,
  originalPrice: Math.round((basePrice + storeIndex * 17000 + index * 9000) * 1.35), rating: Math.max(4.1, store.rating - (index % 4) * 0.1),
  reviewCount: 45 + storeIndex * 38 + index * 29, soldCount: 120 + storeIndex * 80 + index * 47,
  posCount: 38 + index * 3, neuCount: 5 + (index % 3), negCount: 2 + (index % 2),
  posPercent: 84, neuPercent: 11, negPercent: 5,
  aspectBreakdown: [
    { macroCategory: 'PRODUCT', microAspect: 'Material_BuildQuality', posCount: 30, neuCount: 4, negCount: 2, totalMentions: 36 },
    { macroCategory: 'SHIPPING', microAspect: 'Delivery_Speed', posCount: 28, neuCount: 5, negCount: 3, totalMentions: 36 },
    { macroCategory: 'SERVICE', microAspect: 'Consulting_Attitude', posCount: 24, neuCount: 3, negCount: 2, totalMentions: 29 },
  ],
  image: `https://picsum.photos/seed/tiktok-${storeIndex}-${index}/480/480`, platform: 'TikTok Shop',
})); }
export const TIKTOK_SHOP_STORE_CATEGORIES = Object.fromEntries(TIKTOK_SHOP_STORES.map((store, storeIndex) => [
  store.id, [...new Set(PRODUCT_SEEDS.map(([, category]) => category))].map((name, index) => ({ id: `tts-cat-${storeIndex}-${index}`, name })),
]));
export function getTikTokShopProductsForCategory(storeId, categoryId) {
  const index = TIKTOK_SHOP_STORES.findIndex((store) => store.id === storeId); const store = TIKTOK_SHOP_STORES[index];
  if (!store) return []; const products = productsForStore(store, index); const category = TIKTOK_SHOP_STORE_CATEGORIES[storeId]?.find((item) => item.id === categoryId);
  return category ? products.filter((product) => product.categoryName === category.name) : products;
}
export function findTikTokShopProductById(productId) { for (let i = 0; i < TIKTOK_SHOP_STORES.length; i += 1) { const found = productsForStore(TIKTOK_SHOP_STORES[i], i).find((item) => item.id === productId); if (found) return found; } return null; }
export function generateTikTokShopMockComments(product, count = 20) { const names = ['Minh Anh', 'Khánh Linh', 'Tuấn Khang', 'Ngọc Hân', 'Gia Bảo', 'Thanh Vy']; return Array.from({ length: count }, (_, i) => { const sentiment = i % 7 === 0 ? 'NEG' : i % 4 === 0 ? 'NEU' : 'POS'; return { id: `tts-cmt-${product.id}-${i + 1}`, user: names[i % names.length], rating: sentiment === 'POS' ? 5 : sentiment === 'NEU' ? 3 : 2, content: sentiment === 'POS' ? 'Đóng gói đẹp, sản phẩm đúng mô tả và dùng rất ổn.' : sentiment === 'NEU' ? 'Sản phẩm dùng được, giao hàng hơi lâu.' : 'Màu thực tế hơi khác hình, shop cần tư vấn kỹ hơn.', createdAt: new Date(Date.now() - i * 86400000).toISOString(), likes: i * 2, productVariant: 'Mặc định', sentiment, absaTags: [{ aspect: 'Product_Quality', label: 'Chất lượng sản phẩm', sentiment }] }; }); }
