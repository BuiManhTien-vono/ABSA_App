// src/data/lazadaData.js
// Mock data repository for Lazada stores, categories, products, and comments with ABSA tags

export const LAZADA_STORES = [
  {
    id: 'lzd-01',
    name: 'Điện Tử Digital World',
    code: 'LZD_DIGITAL_01',
    status: 'CONNECTED',
    avatar: '💻',
    category: 'Điện tử',
    rating: 4.8,
    reviewCount: 3420,
    followers: 25100,
    revenue: '2.5 tỷ',
    connectedAt: '2026-07-10T09:30:00',
    description: 'Thế giới công nghệ, điện thoại, máy tính và phụ kiện điện tử chính hãng với chế độ bảo hành 12 tháng.',
  },
  {
    id: 'lzd-02',
    name: 'Thời Trang Nam Urban',
    code: 'LZD_URBAN_02',
    status: 'CONNECTED',
    avatar: '👕',
    category: 'Thời trang nam',
    rating: 4.6,
    reviewCount: 1850,
    followers: 12400,
    revenue: '950 tr',
    connectedAt: '2026-06-25T14:15:00',
    description: 'Phong cách thời trang nam năng động, hiện đại từ áo phông, sơ mi đến quần jean và kaki.',
  },
  {
    id: 'lzd-03',
    name: 'Mẹ & Bé Paradise',
    code: 'LZD_MB_03',
    status: 'CONNECTED',
    avatar: '🍼',
    category: 'Mẹ & Bé',
    rating: 4.9,
    reviewCount: 4521,
    followers: 32000,
    revenue: '3.1 tỷ',
    connectedAt: '2026-05-18T10:00:00',
    description: 'Tất cả những gì tốt nhất cho mẹ và bé: bỉm sữa, đồ chơi, quần áo trẻ sơ sinh đạt chuẩn an toàn.',
  },
  {
    id: 'lzd-04',
    name: 'Thể Thao & Outdoor Pro',
    code: 'LZD_SPORT_04',
    status: 'CONNECTED',
    avatar: '⛺',
    category: 'Thể thao',
    rating: 4.7,
    reviewCount: 2100,
    followers: 15800,
    revenue: '1.2 tỷ',
    connectedAt: '2026-08-05T08:45:00',
    description: 'Dụng cụ thể thao, đồ cắm trại, dã ngoại và thời trang outdoor chuyên nghiệp.',
  },
  {
    id: 'lzd-05',
    name: 'Gia Dụng Thông Minh Plus',
    code: 'LZD_HOME_05',
    status: 'CONNECTED',
    avatar: '🏠',
    category: 'Gia dụng',
    rating: 4.8,
    reviewCount: 3890,
    followers: 28600,
    revenue: '4.2 tỷ',
    connectedAt: '2026-07-22T11:20:00',
    description: 'Nâng tầm cuộc sống với các thiết bị gia dụng thông minh, robot hút bụi, máy lọc không khí cao cấp.',
  },
  {
    id: 'lzd-06',
    name: 'Sức Khỏe & Làm Đẹp Care',
    code: 'LZD_HEALTH_06',
    status: 'CONNECTED',
    avatar: '🌿',
    category: 'Sức khỏe & Làm đẹp',
    rating: 4.5,
    reviewCount: 1560,
    followers: 9800,
    revenue: '850 tr',
    connectedAt: '2026-08-12T16:30:00',
    description: 'Thực phẩm chức năng, mỹ phẩm thiên nhiên và các sản phẩm chăm sóc sắc đẹp toàn diện.',
  }
];

export const LAZADA_STORE_CATEGORIES = {
  'lzd-01': [
    { id: 'cat-phone', name: 'Điện Thoại & Tablet', code: 'PHONE', icon: '📱', productCount: 10, description: 'Điện thoại di động các hãng Apple, Samsung, Xiaomi' },
    { id: 'cat-laptop', name: 'Laptop & PC', code: 'LAPTOP', icon: '💻', productCount: 8, description: 'Laptop văn phòng, gaming và thiết kế đồ họa' },
    { id: 'cat-phukien', name: 'Phụ Kiện Điện Tử', code: 'ACCESSORY', icon: '🎧', productCount: 12, description: 'Tai nghe, cáp sạc, củ sạc nhanh' },
  ],
  'lzd-02': [
    { id: 'cat-ao-thun', name: 'Áo Nam', code: 'TSHIRT', icon: '👕', productCount: 10, description: 'Áo thun cotton, polo nam tính, sơ mi' },
    { id: 'cat-quan-nam', name: 'Quần Nam', code: 'PANTS', icon: '👖', productCount: 9, description: 'Quần jean, kaki, quần âu' },
    { id: 'cat-ao-khoac-nam', name: 'Áo Khoác Nam', code: 'JACKET', icon: '🧥', productCount: 8, description: 'Áo khoác dù, bomber, denim' },
  ],
  'lzd-03': [
    { id: 'cat-bim-sua', name: 'Tã & Bỉm Sữa', code: 'MILK_DIAPER', icon: '🍼', productCount: 11, description: 'Sữa bột, tã giấy các loại' },
    { id: 'cat-do-so-sinh', name: 'Đồ Sơ Sinh', code: 'BABY_CLOTHES', icon: '👶', productCount: 10, description: 'Quần áo, bao tay chân cho bé' },
    { id: 'cat-xe-day', name: 'Xe Đẩy & Địu', code: 'STROLLER', icon: '🚼', productCount: 8, description: 'Xe đẩy gấp gọn, địu em bé an toàn' },
  ],
  'lzd-04': [
    { id: 'cat-giay-the-thao', name: 'Giày Thể Thao', code: 'SPORT_SHOES', icon: '👟', productCount: 12, description: 'Giày chạy bộ, bóng đá, bóng rổ' },
    { id: 'cat-do-tap', name: 'Đồ Tập Gym', code: 'GYM_WEAR', icon: '🎽', productCount: 10, description: 'Quần áo tập gym nam nữ co giãn tốt' },
    { id: 'cat-cam-trai', name: 'Đồ Cắm Trại', code: 'CAMPING', icon: '⛺', productCount: 9, description: 'Lều trại, túi ngủ, bàn ghế dã ngoại' },
  ],
  'lzd-05': [
    { id: 'cat-robot', name: 'Robot Hút Bụi', code: 'ROBOT', icon: '🤖', productCount: 8, description: 'Robot hút bụi lau nhà thông minh' },
    { id: 'cat-nha-bep', name: 'Đồ Bếp Thông Minh', code: 'KITCHEN', icon: '🍳', productCount: 12, description: 'Nồi chiên không dầu, máy ép chậm' },
    { id: 'cat-may-loc', name: 'Máy Lọc Không Khí', code: 'AIR_PURIFIER', icon: '🌬️', productCount: 10, description: 'Máy lọc bụi mịn, tạo ẩm' },
  ],
  'lzd-06': [
    { id: 'cat-tpcn', name: 'Thực Phẩm Chức Năng', code: 'SUPPLEMENT', icon: '💊', productCount: 10, description: 'Vitamin, Omega 3, Collagen' },
    { id: 'cat-duong-da', name: 'Dưỡng Da', code: 'SKINCARE', icon: '🧴', productCount: 12, description: 'Kem dưỡng, serum trắng da, trị mụn' },
    { id: 'cat-cham-soc-toc', name: 'Chăm Sóc Tóc', code: 'HAIRCARE', icon: '💇', productCount: 9, description: 'Dầu gội xả giảm rụng tóc, tinh dầu bưởi' },
  ]
};

const PRODUCT_IMAGES = {
  electronics: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
  ],
  mens_fashion: [
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=400&q=80',
  ],
  baby: [
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555252115-467823f9d50b?auto=format&fit=crop&w=400&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584735174965-9ebc4e4ebbc5?auto=format&fit=crop&w=400&q=80',
  ],
  home: [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1523688881335-ed722da10da5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=400&q=80',
  ]
};

function getSampleImage(categoryCode, index) {
  let list = PRODUCT_IMAGES.home;
  if (categoryCode.includes('PHONE') || categoryCode.includes('LAPTOP') || categoryCode.includes('ACCESSORY')) list = PRODUCT_IMAGES.electronics;
  else if (categoryCode.includes('TSHIRT') || categoryCode.includes('PANTS') || categoryCode.includes('JACKET')) list = PRODUCT_IMAGES.mens_fashion;
  else if (categoryCode.includes('MILK_DIAPER') || categoryCode.includes('BABY_CLOTHES') || categoryCode.includes('STROLLER')) list = PRODUCT_IMAGES.baby;
  else if (categoryCode.includes('SPORT_SHOES') || categoryCode.includes('GYM_WEAR') || categoryCode.includes('CAMPING')) list = PRODUCT_IMAGES.sports;
  else if (categoryCode.includes('ROBOT') || categoryCode.includes('KITCHEN') || categoryCode.includes('AIR_PURIFIER')) list = PRODUCT_IMAGES.home;
  else if (categoryCode.includes('SUPPLEMENT') || categoryCode.includes('SKINCARE') || categoryCode.includes('HAIRCARE')) list = PRODUCT_IMAGES.beauty;

  return list[index % list.length];
}

const CATEGORY_PRODUCTS_TEMPLATES = {
  // LZD-01
  'cat-phone': [
    { name: 'Điện Thoại Mới Nhất 256GB - Bản Chuẩn', sku: 'LZ-PH-01', price: 21990000, orig: 24000000, rating: 4.9 },
    { name: 'Smartphone Tầm Trung Chụp Hình Khủng 108MP', sku: 'LZ-PH-02', price: 6590000, orig: 8900000, rating: 4.7 },
    { name: 'Tablet 11 inch Màn Hình 2K Kèm Bút', sku: 'LZ-PH-03', price: 8290000, orig: 9990000, rating: 4.8 },
    { name: 'Điện Thoại Gập Siêu Mỏng Nhẹ 128GB', sku: 'LZ-PH-04', price: 18500000, orig: 22000000, rating: 4.6 },
  ],
  'cat-laptop': [
    { name: 'Laptop Ultrabook Nhôm Nguyên Khối 13.3 inch', sku: 'LZ-LT-01', price: 17590000, orig: 20000000, rating: 4.8 },
    { name: 'Laptop Gaming Cấu Hình Cao RTX 3050', sku: 'LZ-LT-02', price: 22590000, orig: 26000000, rating: 4.7 },
    { name: 'PC Đồng Bộ Văn Phòng Nhỏ Gọn Kèm Chuột Phím', sku: 'LZ-LT-03', price: 8490000, orig: 10500000, rating: 4.5 },
  ],
  'cat-phukien': [
    { name: 'Tai Nghe True Wireless Chống Ồn ANC', sku: 'LZ-AC-01', price: 1290000, orig: 1890000, rating: 4.9 },
    { name: 'Củ Sạc Nhanh GaN 65W Siêu Nhỏ Gọn', sku: 'LZ-AC-02', price: 390000, orig: 550000, rating: 4.8 },
    { name: 'Pin Sạc Dự Phòng 10000mAh Có Magsafe', sku: 'LZ-AC-03', price: 590000, orig: 800000, rating: 4.7 },
  ],
  
  // LZD-02
  'cat-ao-thun': [
    { name: 'Áo Polo Nam Form Regular Fit Chất Cực Mát', sku: 'LZ-TS-01', price: 299000, orig: 450000, rating: 4.8 },
    { name: 'Áo Thun Nam Cổ Tròn Cotton 100% Thoáng Mồ Hôi', sku: 'LZ-TS-02', price: 149000, orig: 250000, rating: 4.7 },
    { name: 'Áo Sơ Mi Nam Tay Dài Kẻ Sọc Công Sở', sku: 'LZ-TS-03', price: 359000, orig: 500000, rating: 4.9 },
  ],
  'cat-quan-nam': [
    { name: 'Quần Jean Nam Ống Đứng Dáng Suông', sku: 'LZ-PA-01', price: 429000, orig: 600000, rating: 4.8 },
    { name: 'Quần Kaki Nam Túi Hộp Trẻ Trung Dã Ngoại', sku: 'LZ-PA-02', price: 349000, orig: 490000, rating: 4.6 },
    { name: 'Quần Âu Nam Form Slimfit Lên Dáng Đẹp', sku: 'LZ-PA-03', price: 299000, orig: 450000, rating: 4.7 },
  ],
  'cat-ao-khoac-nam': [
    { name: 'Áo Khoác Gió Nam Hai Lớp Chống Nước', sku: 'LZ-JK-01', price: 259000, orig: 400000, rating: 4.8 },
    { name: 'Áo Bomber Nam Lót Nỉ Đẹp Nam Tính', sku: 'LZ-JK-02', price: 499000, orig: 750000, rating: 4.9 },
    { name: 'Áo Khoác Denim Rách Dáng Bụi Bặm', sku: 'LZ-JK-03', price: 399000, orig: 550000, rating: 4.6 },
  ],

  // LZD-03
  'cat-bim-sua': [
    { name: 'Bỉm Quần Mỏng Nhẹ Thấm Hút Tốt Size L', sku: 'LZ-MD-01', price: 259000, orig: 350000, rating: 4.9 },
    { name: 'Sữa Công Thức Cho Bé Từ 1-3 Tuổi Vị Vanilla 800g', sku: 'LZ-MD-02', price: 549000, orig: 650000, rating: 4.8 },
    { name: 'Bột Ăn Dặm Hữu Cơ Vị Rau Củ Dễ Tiêu Hóa', sku: 'LZ-MD-03', price: 120000, orig: 180000, rating: 4.7 },
  ],
  'cat-do-so-sinh': [
    { name: 'Bộ Quần Áo Sơ Sinh Chất Petit Siêu Mềm Cho Bé', sku: 'LZ-BB-01', price: 139000, orig: 200000, rating: 4.9 },
    { name: 'Chăn Quấn Bé Sơ Sinh Mùa Đông Ấm Áp', sku: 'LZ-BB-02', price: 199000, orig: 280000, rating: 4.8 },
    { name: 'Set Bao Tay Bao Chân Bằng Cotton Mịn', sku: 'LZ-BB-03', price: 49000, orig: 80000, rating: 4.7 },
  ],
  'cat-xe-day': [
    { name: 'Xe Đẩy Gấp Gọn Siêu Nhẹ Du Lịch Cho Bé', sku: 'LZ-ST-01', price: 1250000, orig: 1600000, rating: 4.8 },
    { name: 'Địu Vải Trợ Lực Chuẩn Ergonomic Hỗ Trợ Xương Khớp', sku: 'LZ-ST-02', price: 450000, orig: 650000, rating: 4.7 },
  ],

  // LZD-04
  'cat-giay-the-thao': [
    { name: 'Giày Chạy Bộ Nam Nữ Đế Khí Đàn Hồi Tốt', sku: 'LZ-SH-01', price: 1290000, orig: 1800000, rating: 4.9 },
    { name: 'Giày Bóng Đá Đinh TF Bám Sân', sku: 'LZ-SH-02', price: 850000, orig: 1200000, rating: 4.8 },
    { name: 'Sneaker Thể Thao Phản Quang Nổi Bật', sku: 'LZ-SH-03', price: 950000, orig: 1400000, rating: 4.7 },
  ],
  'cat-do-tap': [
    { name: 'Bộ Quần Áo Gym Nam Thoát Mồ Hôi Nhanh', sku: 'LZ-GW-01', price: 320000, orig: 500000, rating: 4.8 },
    { name: 'Quần Legging Thể Thao Nữ Cạp Cao Tôn Dáng', sku: 'LZ-GW-02', price: 250000, orig: 400000, rating: 4.9 },
    { name: 'Áo Bra Thể Thao Nâng Đỡ Tốt Khóa Cài Trực Tiếp', sku: 'LZ-GW-03', price: 199000, orig: 350000, rating: 4.7 },
  ],
  'cat-cam-trai': [
    { name: 'Lều Cắm Trại 4 Người Tự Bung Cống Nước', sku: 'LZ-CP-01', price: 890000, orig: 1200000, rating: 4.8 },
    { name: 'Túi Ngủ Giữ Ấm Mùa Đông Đi Phượt Dã Ngoại', sku: 'LZ-CP-02', price: 350000, orig: 550000, rating: 4.6 },
    { name: 'Bếp Ga Mini Gấp Gọn Hợp Kim Siêu Nhẹ', sku: 'LZ-CP-03', price: 210000, orig: 320000, rating: 4.7 },
  ],

  // LZD-05
  'cat-robot': [
    { name: 'Robot Hút Bụi Lau Nhà 2 Trong 1 Lực Hút 3000Pa', sku: 'LZ-RB-01', price: 4200000, orig: 6000000, rating: 4.8 },
    { name: 'Robot Hút Bụi Tự Đổ Rác Quét Map Laser 3D', sku: 'LZ-RB-02', price: 8500000, orig: 10500000, rating: 4.9 },
  ],
  'cat-nha-bep': [
    { name: 'Nồi Chiên Không Dầu Điện Tử Lòng Rộng 6L', sku: 'LZ-KC-01', price: 1490000, orig: 2200000, rating: 4.8 },
    { name: 'Máy Ép Trái Cây Chậm Giữ Nguyên Vitamin', sku: 'LZ-KC-02', price: 1850000, orig: 2500000, rating: 4.7 },
    { name: 'Máy Xay Sinh Tố Đa Năng Cối Thủy Tinh Kháng Khuẩn', sku: 'LZ-KC-03', price: 890000, orig: 1250000, rating: 4.8 },
  ],
  'cat-may-loc': [
    { name: 'Máy Lọc Không Khí Diệt Khuẩn HEPA 13 Tạo Ion', sku: 'LZ-AP-01', price: 3200000, orig: 4500000, rating: 4.9 },
    { name: 'Máy Hút Ẩm Kèm Sấy Quần Áo Dung Tích Lớn 12L', sku: 'LZ-AP-02', price: 4500000, orig: 5800000, rating: 4.8 },
  ],

  // LZD-06
  'cat-tpcn': [
    { name: 'Viên Uống Dầu Cá Omega 3 Của Úc 400 Viên', sku: 'LZ-SP-01', price: 550000, orig: 750000, rating: 4.9 },
    { name: 'Vitamin Tổng Hợp Cho Người Lớn Tuổi Bổ Sung Năng Lượng', sku: 'LZ-SP-02', price: 620000, orig: 850000, rating: 4.8 },
    { name: 'Viên Uống Collagen Peptides Dưỡng Trắng Da Mờ Nám', sku: 'LZ-SP-03', price: 480000, orig: 650000, rating: 4.7 },
  ],
  'cat-duong-da': [
    { name: 'Kem Dưỡng Ẩm Phục Hồi Ban Đêm Chiết Xuất Cúc La Mã', sku: 'LZ-SK-01', price: 350000, orig: 500000, rating: 4.8 },
    { name: 'Serum Trắng Da Vitamin C Nguyên Chất 10%', sku: 'LZ-SK-02', price: 420000, orig: 650000, rating: 4.9 },
    { name: 'Nước Hoa Hồng Toner Kiềm Dầu Cho Da Mụn', sku: 'LZ-SK-03', price: 250000, orig: 350000, rating: 4.7 },
  ],
  'cat-cham-soc-toc': [
    { name: 'Dầu Gội Bưởi Ngăn Rụng Kích Thích Mọc Tóc 500ml', sku: 'LZ-HC-01', price: 210000, orig: 300000, rating: 4.8 },
    { name: 'Dầu Dưỡng Tóc Argan Oil Óng Mượt Không Bết Dính', sku: 'LZ-HC-02', price: 350000, orig: 500000, rating: 4.9 },
  ],
};

const VIETNAMESE_NAMES = [
  'tuan_anh_99', 'ngoc_mai_vu', 'minh.tri.le', 'hoang_yen_hn', 'quang_huy_sg',
  'thao.nguyen', 'dinh_van_h', 'lan_anh_beauty', 'tien_dat_it', 'phuong.thanh',
  'bich_ngoc_98', 'hai.dang.12', 'quynh_nhu', 'thuy_linh_90', 'viet_dung',
  'nam.phong', 'thu_huong.ng', 'quang.thang', 'mai.phuong.11', 'bao_tran',
];

export function getLazadaProductsForCategory(storeId, categoryId) {
  const templates = CATEGORY_PRODUCTS_TEMPLATES[categoryId] || [];
  const categories = LAZADA_STORE_CATEGORIES[storeId] || [];
  const category = categories.find(c => c.id === categoryId);

  if (!category) return [];

  const products = [];
  
  templates.forEach((template, idx) => {
    products.push({
      id: `${storeId}-${categoryId}-p${idx + 1}`,
      storeId,
      categoryId,
      categoryName: category.name,
      name: template.name,
      sku: template.sku,
      price: template.price,
      originalPrice: template.orig,
      discount: Math.round(((template.orig - template.price) / template.orig) * 100),
      rating: template.rating,
      sold: Math.floor(Math.random() * 2000) + 100,
      stock: Math.floor(Math.random() * 500) + 10,
      image: getSampleImage(category.code, idx),
      description: `${template.name} chính hãng chất lượng cao. Bảo hành đầy đủ, hỗ trợ đổi trả 7 ngày.`,
      specs: [
        { name: 'Thương hiệu', value: 'OEM' },
        { name: 'Xuất xứ', value: 'Việt Nam/Trung Quốc' },
        { name: 'Tình trạng', value: 'Mới 100%' }
      ]
    });
  });
  
  return products;
}

export function findLazadaProductById(productId) {
  if (!productId) return null;
  const parts = productId.split('-');
  if (parts.length < 4) return null;
  
  const storeId = `${parts[0]}-${parts[1]}`;
  const catPrefix = parts[2];
  const catSuffix = parts[3]; 
  const categoryId = `${catPrefix}-${catSuffix}`;
  
  const categories = LAZADA_STORE_CATEGORIES[storeId];
  if (!categories) return null;
  
  for (const category of categories) {
    if (category.id === categoryId || category.id === productId.replace(`${storeId}-`, '').split('-p')[0]) {
      const realCatId = category.id;
      const products = getLazadaProductsForCategory(storeId, realCatId);
      return products.find(p => p.id === productId) || null;
    }
  }
  return null;
}

import { generateMockComments } from './shopeeData';

export function generateLazadaMockComments(product, count = 50) {
  const comments = generateMockComments(product, count);
  return comments.map((c, i) => ({
    id: `lzd-cmt-${product.id}-${String(i + 1).padStart(3, '0')}`,
    user: c.userName,
    avatar: `https://i.pravatar.cc/150?u=lzd_${i}_${product.id}`,
    rating: c.starRating,
    content: c.content,
    createdAt: new Date(Date.parse('2026-08-30T12:00:00Z') - (i * 14400000)).toISOString(),
    likes: c.helpfulVotes,
    images: [],
    hasPurchase: true,
    productVariant: c.variant || 'Mặc định',
    absaTags: c.aspects,
    sentiment: c.sentiment
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
