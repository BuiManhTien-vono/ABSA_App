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
  ['Áo khoác chống nắng dáng rộng', 'Thời trang', 189000], 
  ['Bình giữ nhiệt nắp bật 600ml', 'Gia dụng', 129000],
  ['Đèn ngủ cảm biến ánh sáng', 'Đồ dùng nhà', 99000], 
  ['Tai nghe Bluetooth âm thanh nổi', 'Điện tử', 259000],
  ['Set 5 khăn lau đa năng', 'Đồ dùng nhà', 69000], 
  ['Túi tote canvas phong cách Hàn', 'Phụ kiện', 79000],
  ['Máy massage mini cầm tay', 'Chăm sóc cá nhân', 219000], 
  ['Hộp cơm giữ nhiệt 2 tầng', 'Nhà bếp', 179000],
  ['Bộ sticker trang trí journal', 'Văn phòng phẩm', 45000], 
  ['Kệ để điện thoại gấp gọn', 'Phụ kiện', 59000],
  ['Nước hoa sáp hương trà trắng', 'Làm đẹp', 149000], 
  ['Gối cổ memory foam du lịch', 'Đời sống', 159000],
];

export const TIKTOK_SHOP_STORES = SHOP_SEEDS.map(([id, name, code, category, avatar, rating, followers], index) => ({
  id, name, code, category, avatar, rating, followers, status: 'CONNECTED', reviewCount: 860 + index * 417,
  revenue: `${(0.62 + index * 0.31).toFixed(2)} tỷ`, connectedAt: `2026-09-${String(2 + index).padStart(2, '0')}T10:00:00`,
  description: `Cửa hàng TikTok Shop chuyên ${category.toLowerCase()}, nội dung livestream được yêu thích.`,
}));

function productsForStore(store, storeIndex) { 
  return PRODUCT_SEEDS.map(([name, category, basePrice], index) => ({
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
  })); 
}

export const TIKTOK_SHOP_STORE_CATEGORIES = Object.fromEntries(TIKTOK_SHOP_STORES.map((store, storeIndex) => [
  store.id, [...new Set(PRODUCT_SEEDS.map(([, category]) => category))].map((name, index) => ({ id: `tts-cat-${storeIndex}-${index}`, name })),
]));

export function getTikTokShopProductsForCategory(storeId, categoryId) {
  const index = TIKTOK_SHOP_STORES.findIndex((store) => store.id === storeId); 
  const store = TIKTOK_SHOP_STORES[index];
  if (!store) return []; 
  const products = productsForStore(store, index); 
  const category = TIKTOK_SHOP_STORE_CATEGORIES[storeId]?.find((item) => item.id === categoryId);
  return category ? products.filter((product) => product.categoryName === category.name) : products;
}

export function findTikTokShopProductById(productId) { 
  for (let i = 0; i < TIKTOK_SHOP_STORES.length; i += 1) { 
    const found = productsForStore(TIKTOK_SHOP_STORES[i], i).find((item) => item.id === productId); 
    if (found) return found; 
  } 
  return null; 
}

const TIKTOK_NAMES = [
  'linh_xinh_99', 'boy_streetwear_hn', 'me_ha_ben', 'toktok_buyer_01', 'huyen.baby.98',
  'hung_review_tech', 'ngoc_beauty_skincare', 'ha_vlog_97', 'tuan_anh_decor', 'tram_anh_fashion',
  'minh_tri_stream', 'lan_gongcha', 'phuong.thao_sg', 'viet.dung_fit', 'bao.trang_cutie',
  'dat_nong_dan', 'thuy.vy_review', 'hoang_tuan_95', 'khanh.linh_genz', 'nam_phong_shop'
];

const TIKTOK_COMMENT_TEMPLATES = {
  POS: [
    { text: 'Săn trên Live TikTok deal hời xỉu! Hàng giao siêu nhanh 2 ngày đã nhận được, chất lượng bọc nilon 3 lớp chuẩn chỉnh.', aspects: [{ aspect: 'Price_Performance_Ratio', label: 'Giá săn Live', sentiment: 'POS' }, { aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'POS' }] },
    { text: 'Xinh xỉu luôn mng ơi! Mùi thơm nhẹ dịu sang chảnh, màu chuẩn như hình mẫu trên livestream shop luôn.', aspects: [{ aspect: 'Design_Appearance', label: 'Kiểu dáng màu sắc', sentiment: 'POS' }, { aspect: 'Livestream_Consultation', label: 'Tư vấn trên Live', sentiment: 'POS' }] },
    { text: 'Gõ nảy đầm tay, đèn LED RGB lập lòe cực chill. Mua đúng đợt săn voucher 50k trên TikTok Shop giá rẻ bất ngờ!', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Đáng tiền', sentiment: 'POS' }] },
    { text: 'Form mặc lên tôn dáng siêu cấp. Vải cotton mềm mát giặt máy không bị xù lông hay phai màu chút nào.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu vải', sentiment: 'POS' }, { aspect: 'Design_Appearance', label: 'Form dáng', sentiment: 'POS' }] },
    { text: 'Set khăn lau dày dặn thấm nước cực tốt. Shop đóng gói cẩn thận có tặng kèm sticker quà tặng dễ thương nữa.', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'POS' }, { aspect: 'Customer_Support', label: 'Quà tặng kèm', sentiment: 'POS' }] },
    { text: 'Tai nghe âm bass căng đét, mic thu âm đàm thoại trong vắt không bị rè hay nhiễu sóng khi đi ngoài đường.', aspects: [{ aspect: 'Sound_Quality', label: 'Chất lượng âm thanh', sentiment: 'POS' }] },
    { text: 'Máy massage dùng siêu thích, bóp êm dịu bớt mỏi cổ vai sau ngày làm việc. Đáng từng đồng bỏ ra luôn nha!', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Mức độ đáng tiền', sentiment: 'POS' }] },
    { text: 'Shop tư vấn nhiệt tình trên Live, hỏi size nào rep ngay size đó. Đã mua thêm 2 cái ủng hộ shop tiếp!', aspects: [{ aspect: 'Consulting_Attitude', label: 'Thái độ CSKH Live', sentiment: 'POS' }] },
    { text: 'Bình giữ nhiệt giữ đá lạnh từ sáng tới chiều tối chưa tan hết. Chất liệu inox 304 an toàn chắc chắn.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu inox', sentiment: 'POS' }, { aspect: 'Performance_Functionality', label: 'Giữ nhiệt', sentiment: 'POS' }] },
  ],
  NEU: [
    { text: 'Hàng dùng tạm ổn trong tầm giá. Tuy nhiên vỏ hộp bọc hơi móp nhẹ góc do shipper quăng quật.', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'NEU' }, { aspect: 'Price_Performance_Ratio', label: 'Tầm giá', sentiment: 'NEU' }] },
    { text: 'Màu thực tế ngoài đời hơi tối hơn 1 tone so with filter trên video livestream TikTok của shop.', aspects: [{ aspect: 'Design_Appearance', label: 'Màu sắc thực tế', sentiment: 'NEU' }] },
    { text: 'Giao hàng tầm 3-4 ngày hơi lâu một chút nhưng sản phẩm bên trong bọc xốp cẩn thận không sao.', aspects: [{ aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'NEU' }] },
    { text: 'Mùi hương sáp ban đầu hơi nồng nhẹ, dùng tầm 15 phút sau mới dịu lại thơm thoang thoảng.', aspects: [{ aspect: 'Performance_Functionality', label: 'Mùi hương', sentiment: 'NEU' }] },
    { text: 'Chất vải mỏng nhẹ hợp mặc mùa hè, chỉ thừa ở cổ áo và đường may còn tương đối.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu gia công', sentiment: 'NEU' }] },
  ],
  NEG: [
    { text: 'Giao nhầm phân loại màu rồi shop ơi! Đặt màu đen mà giao màu xám trắng. Nhắn tin CSKH từ sáng chưa reply.', aspects: [{ aspect: 'Fulfillment_Accuracy', label: 'Giao nhầm hàng', sentiment: 'NEG' }, { aspect: 'Customer_Support', label: 'Hỗ trợ CSKH', sentiment: 'NEG' }] },
    { text: 'Nút bấm bị kẹt cứng sau 2 ngày dùng. Đề nghị shop cho liên hệ đổi bảo hành gấp giúp mình!', aspects: [{ aspect: 'Product_Defect', label: 'Lỗi sản phẩm', sentiment: 'NEG' }] },
    { text: 'Hứa tặng quà kèm quà tặng trên Livestream mà mở gói hàng ra không thấy quà đâu hết trơn.', aspects: [{ aspect: 'Customer_Support', label: 'Thiếu quà tặng Live', sentiment: 'NEG' }] },
    { text: 'Chất vải mỏng hơn quảng cáo trên video nhiều, vải hơi thô ráp. Thất vọng so với kỳ vọng.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất lượng vải', sentiment: 'NEG' }] },
    { text: 'Pin tụt nhanh lắm mng ơi, sạc đầy 100% dùng tầm 1 tiếng rưỡi là báo hết pin tắt nguồn rồi.', aspects: [{ aspect: 'Battery_Life', label: 'Thời lượng pin', sentiment: 'NEG' }] },
  ]
};

import { generateMockComments } from './shopeeData';

export function generateTikTokShopMockComments(product, count = 50) {
  const comments = generateMockComments(product, count);
  return comments.map((c, i) => ({
    id: `tts-cmt-${product.id}-${String(i + 1).padStart(3, '0')}`,
    user: c.userName,
    avatar: `https://i.pravatar.cc/150?u=tiktok_${i}_${product.id}`,
    rating: c.starRating,
    content: c.content,
    createdAt: new Date(Date.parse('2026-08-30T12:00:00Z') - (i * 14400000)).toISOString(),
    likes: c.helpfulVotes,
    productVariant: c.variant ? `${c.variant} (Săn Live TikTok)` : 'Mặc định (TikTok Live)',
    sentiment: c.sentiment,
    absaTags: c.aspects,
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
