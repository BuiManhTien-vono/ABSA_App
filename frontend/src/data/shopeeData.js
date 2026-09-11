// src/data/shopeeData.js
// Mock data repository for Shopee stores, categories, products, and comments with ABSA tags

export const SHOPEE_STORES = [
  {
    id: 'spe-01',
    name: 'Thời Trang Nữ Bella',
    code: 'SPE_BELLA_01',
    status: 'CONNECTED',
    avatar: '👗',
    category: 'Thời trang',
    rating: 4.8,
    reviewCount: 2340,
    followers: 12500,
    revenue: '1.2 tỷ',
    connectedAt: '2026-07-15T10:30:00',
    description: 'Thương hiệu thời trang nữ thiết kế thanh lịch, đón đầu xu hướng với chất liệu cao cấp.',
  },
  {
    id: 'spe-02',
    name: 'Mỹ Phẩm Hàn Quốc',
    code: 'SPE_MPHQ_02',
    status: 'CONNECTED',
    avatar: '💄',
    category: 'Mỹ phẩm',
    rating: 4.6,
    reviewCount: 1567,
    followers: 8900,
    revenue: '856 tr',
    connectedAt: '2026-07-20T14:15:00',
    description: 'Chuyên mỹ phẩm skincare và make-up chuẩn Hàn nhập khẩu chính ngạch 100%.',
  },
  {
    id: 'spe-03',
    name: 'Điện Tử Thông Minh',
    code: 'SPE_DTTU_03',
    status: 'CONNECTED',
    avatar: '📱',
    category: 'Điện tử',
    rating: 4.7,
    reviewCount: 4521,
    followers: 34200,
    revenue: '3.5 tỷ',
    connectedAt: '2026-06-10T09:00:00',
    description: 'Đại lý phân phối thiết bị công nghệ, điện thoại, máy tính và đồ thông minh chính hãng.',
  },
  {
    id: 'spe-04',
    name: 'Phụ Kiện Điện Thoại Pro',
    code: 'SPE_PKDT_04',
    status: 'CONNECTED',
    avatar: '🔌',
    category: 'Phụ kiện',
    rating: 4.5,
    reviewCount: 5890,
    followers: 21300,
    revenue: '2.1 tỷ',
    connectedAt: '2026-05-22T08:45:00',
    description: 'Cung cấp ốp lưng, củ cáp sạc nhanh, tai nghe và phụ kiện điện thoại hàng đầu.',
  },
  {
    id: 'spe-05',
    name: 'Thực Phẩm Sạch Organic',
    code: 'SPE_TPSC_05',
    status: 'CONNECTED',
    avatar: '🥗',
    category: 'Thực phẩm',
    rating: 4.9,
    reviewCount: 890,
    followers: 5600,
    revenue: '430 tr',
    connectedAt: '2026-08-01T11:20:00',
    description: 'Nông sản hữu cơ, trái cây nhập khẩu tươi ngon đạt chuẩn VietGAP và USDA Organic.',
  },
  {
    id: 'spe-06',
    name: 'Giày Dép Sneaker Hub',
    code: 'SPE_GDSH_06',
    status: 'CONNECTED',
    avatar: '👟',
    category: 'Giày dép',
    rating: 4.4,
    reviewCount: 3210,
    followers: 15800,
    revenue: '1.8 tỷ',
    connectedAt: '2026-06-28T16:30:00',
    description: 'Thế giới giày sneaker thời trang trẻ trung, năng động và phụ kiện giày chuyên nghiệp.',
  },
  {
    id: 'spe-07',
    name: 'Đồ Gia Dụng Tiện Ích',
    code: 'SPE_DGDT_07',
    status: 'CONNECTED',
    avatar: '🏠',
    category: 'Gia dụng',
    rating: 4.6,
    reviewCount: 2876,
    followers: 11200,
    revenue: '1.5 tỷ',
    connectedAt: '2026-07-05T13:00:00',
    description: 'Giải pháp gia dụng thông minh nâng tầm tiện nghi cho không gian sống hiện đại.',
  },
  {
    id: 'spe-08',
    name: 'Sách & Văn Phòng Phẩm',
    code: 'SPE_SVPP_08',
    status: 'CONNECTED',
    avatar: '📚',
    category: 'Sách',
    rating: 4.8,
    reviewCount: 1234,
    followers: 7400,
    revenue: '320 tr',
    connectedAt: '2026-08-12T10:00:00',
    description: 'Nhà sách trực tuyến với hàng ngàn đầu sách kinh tế, văn học, kỹ năng và sổ tay cao cấp.',
  },
  {
    id: 'spe-09',
    name: 'Đồ Chơi Trẻ Em Happy',
    code: 'SPE_DCTE_09',
    status: 'CONNECTED',
    avatar: '🧸',
    category: 'Đồ chơi',
    rating: 4.7,
    reviewCount: 654,
    followers: 4200,
    revenue: '280 tr',
    connectedAt: '2026-08-20T15:45:00',
    description: 'Đồ chơi giáo dục, xếp hình trí tuệ, thú bông an toàn tuyệt đối cho bé yêu.',
  },
  {
    id: 'spe-10',
    name: 'Nội Thất Decor Home',
    code: 'SPE_NTDH_10',
    status: 'CONNECTED',
    avatar: '🛋️',
    category: 'Nội thất',
    rating: 4.5,
    reviewCount: 1890,
    followers: 9800,
    revenue: '2.3 tỷ',
    connectedAt: '2026-06-15T09:30:00',
    description: 'Nội thất tối giản Scandinavia, bàn ghế công thái học và đồ decor nhà cửa tinh tế.',
  },
];

// Categories definition by store
export const STORE_CATEGORIES = {
  'spe-01': [
    { id: 'cat-ao', name: 'Áo Nữ', code: 'AO_NU', icon: '👚', productCount: 12, description: 'Áo sơ mi lụa, áo thun baby tee, croptop cá tính, áo kiểu công sở' },
    { id: 'cat-quan', name: 'Quần Nữ', code: 'QUAN_NU', icon: '👖', productCount: 11, description: 'Quần jean ống rộng, quần tây cạp cao, culottes, baggy tôn dáng' },
    { id: 'cat-vay-dam', name: 'Váy & Đầm', code: 'VAY_DAM', icon: '👗', productCount: 12, description: 'Đầm maxi dạo phố, váy chữ A xếp ly, đầm body dự tiệc thanh lịch' },
    { id: 'cat-ao-khoac', name: 'Áo Khoác & Blazer', code: 'AO_KHOAC', icon: '🧥', productCount: 11, description: 'Blazer dáng suông 2 lớp, áo dạ tweed, cardigan dệt kim mỏng' },
    { id: 'cat-giay', name: 'Giày & Phụ Kiện', code: 'GIAY_PK', icon: '👠', productCount: 10, description: 'Giày cao gót tiểu thư, sandal quai mảnh, boot da và túi xách' },
  ],
  'spe-02': [
    { id: 'cat-skincare', name: 'Chăm Sóc Da Mặt', code: 'SKINCARE', icon: '💧', productCount: 12, description: 'Serum B5 phục hồi, tinh chất Vitamin C, kem dưỡng ẩm chuyên sâu' },
    { id: 'cat-son-moi', name: 'Son Môi', code: 'SON_MOI', icon: '💄', productCount: 11, description: 'Son kem lì velvet, son tint bóng mọng môi, son dưỡng có màu' },
    { id: 'cat-chong-nang', name: 'Kem Chống Nắng', code: 'KCN', icon: '🧴', productCount: 10, description: 'Kem chống nắng quang phổ rộng SPF50+, kiềm dầu nâng tone nhẹ' },
    { id: 'cat-lam-sach', name: 'Làm Sạch & Tẩy Trang', code: 'LAM_SACH', icon: '🧼', productCount: 11, description: 'Nước tẩy trang dịu nhẹ, sữa rửa mặt tạo bọt, tẩy tế bào chết' },
    { id: 'cat-mat-na', name: 'Mặt Nạ Dưỡng Da', code: 'MAT_NA', icon: '🎭', productCount: 10, description: 'Mặt nạ giấy cấp ẩm tức thì, mặt nạ đất sét hút dầu, mặt nạ ngủ' },
  ],
  'spe-03': [
    { id: 'cat-dien-thoai', name: 'Điện Thoại & Tablet', code: 'PHONE', icon: '📱', productCount: 12, description: 'Smartphone 5G cấu hình khủng, máy tính bảng phục vụ học tập và đồ họa' },
    { id: 'cat-laptop', name: 'Laptop & Máy Tính', code: 'LAPTOP', icon: '💻', productCount: 10, description: 'Laptop mỏng nhẹ văn phòng, laptop gaming hiệu năng cao, linh kiện PC' },
    { id: 'cat-am-thanh', name: 'Tai Nghe & Âm Thanh', code: 'AUDIO', icon: '🎧', productCount: 12, description: 'Tai nghe chụp tai chống ồn ANC, tai nghe TWS bluetooth, loa di động' },
    { id: 'cat-smarthome', name: 'Thiết Bị Nhà Thông Minh', code: 'SMARTHOME', icon: '💡', productCount: 11, description: 'Đèn LED thông minh, camera an ninh 360, robot hút bụi lau nhà' },
    { id: 'cat-phu-kien-pc', name: 'Bàn Phím & Chuột Gaming', code: 'KEYBOARD_MOUSE', icon: '⌨️', productCount: 11, description: 'Bàn phím cơ hotswap RGB, chuột công thái học không dây' },
  ],
  'spe-04': [
    { id: 'cat-op-lung', name: 'Ốp Lưng & Bao Da', code: 'CASE', icon: '🛡️', productCount: 11, description: 'Ốp lưng silicon dẻo, ốp chống sốc quân đội, ốp viền kim loại' },
    { id: 'cat-cu-cap-sac', name: 'Củ Cáp Sạc Nhanh', code: 'CHARGER', icon: '🔌', productCount: 12, description: 'Củ sạc GaN 65W/100W, cáp sạc bọc dù Type-C to Lightning bền bỉ' },
    { id: 'cat-kinh-cuong-luc', name: 'Kính Cường Lực', code: 'SCREEN_PROTECTOR', icon: '📱', productCount: 10, description: 'Kính cường lực 9D full màn hình, chống nhìn trộm, chống bám vân tay' },
    { id: 'cat-tai-nghe-pk', name: 'Tai Nghe Không Dây', code: 'EARPHONES', icon: '🎵', productCount: 11, description: 'Tai nghe bluetooth đàm thoại chống ồn, độ trễ thấp chơi game' },
  ],
  'spe-05': [
    { id: 'cat-trai-cay', name: 'Trái Cây Nhập Khẩu', code: 'FRUITS', icon: '🍎', productCount: 11, description: 'Cherry Mỹ, táo Envy New Zealand, nho mẫu đơn Hàn Quốc tươi ngọt' },
    { id: 'cat-rau-cu', name: 'Rau Củ Quả Hữu Cơ', code: 'VEGETABLES', icon: '🥦', productCount: 10, description: 'Rau xanh chuẩn VietGAP, củ quả sạch không thuốc trừ sâu' },
    { id: 'cat-hat-dinh-duong', name: 'Hạt & Ngũ Cốc', code: 'NUTS', icon: '🥜', productCount: 11, description: 'Hạt mắc ca, hạnh nhân sấy mộc, ngũ cốc Granola ăn kiêng giảm cân' },
    { id: 'cat-tra-thao-moc', name: 'Trà Thảo Mộc Healthy', code: 'TEA', icon: '🍵', productCount: 10, description: 'Trà hoa cúc dưỡng nhan, trà gạo lứt đậu đen, mật ong rừng nguyên chất' },
  ],
  'spe-06': [
    { id: 'cat-sneaker-the-thao', name: 'Sneaker Thể Thao', code: 'SPORT_SNEAKER', icon: '👟', productCount: 12, description: 'Giày chạy bộ êm ái, giày tập gym đế bám, sneaker thời trang cổ thấp' },
    { id: 'cat-giay-casual', name: 'Giày Lười & Casual', code: 'CASUAL_SHOES', icon: '👞', productCount: 10, description: 'Giày lười da êm chân, giày vải canvas phong cách đường phố' },
    { id: 'cat-sandal-dep', name: 'Sandal & Dép Slide', code: 'SANDAL_SLIDE', icon: '🩴', productCount: 11, description: 'Dép bánh mì siêu êm, sandal quai dù kháng nước đi mưa' },
    { id: 'cat-ve-sinh-giay', name: 'Bộ Vệ Sinh & Phụ Kiện', code: 'SHOE_CARE', icon: '🧽', productCount: 10, description: 'Bình xịt bọt nano làm sạch giày, xịt chống thấm nano, lót giày êm ái' },
  ],
  'spe-07': [
    { id: 'cat-nha-bep', name: 'Thiết Bị Nhà Bếp', code: 'KITCHEN', icon: '🍳', productCount: 12, description: 'Nồi chiên không dầu điện tử, máy làm sữa hạt, ấm siêu tốc giữ nhiệt' },
    { id: 'cat-don-dep', name: 'Dụng Cụ Dọn Dẹp', code: 'CLEANING', icon: '🧹', productCount: 10, description: 'Cây lau nhà tự vắt xoay 360, máy hút bụi cầm tay không dây' },
    { id: 'cat-chieu-sang', name: 'Đèn & Chiếu Sáng', code: 'LIGHTING', icon: '💡', productCount: 11, description: 'Đèn bàn bảo vệ thị lực chống cận, đèn ngủ cảm ứng chuyển động' },
    { id: 'cat-phong-tam', name: 'Tiện Ích Phòng Tắm', code: 'BATHROOM', icon: '🚿', productCount: 10, description: 'Vòi sen tăng áp lọc nước, kệ để đồ dán tường chống rỉ sét' },
  ],
  'spe-08': [
    { id: 'cat-sach-kinh-doanh', name: 'Sách Kinh Doanh & Đầu Tư', code: 'BUSINESS_BOOKS', icon: '📈', productCount: 11, description: 'Sách khởi nghiệp, quản trị doanh nghiệp, marketing và phân tích tài chính' },
    { id: 'cat-phat-trien-ban-than', name: 'Phát Triển Bản Thân', code: 'SELF_HELP', icon: '🧠', productCount: 12, description: 'Sách rèn luyện thói quen, tâm lý học ứng dụng và kỹ năng giao tiếp' },
    { id: 'cat-van-hoc', name: 'Tiểu Thuyết & Văn Học', code: 'LITERATURE', icon: '📖', productCount: 10, description: 'Văn học kinh điển thế giới, tiểu thuyết trinh thám hồi hộp ly kỳ' },
    { id: 'cat-so-but', name: 'Sổ Tay & Bút Viết Cao Cấp', code: 'STATIONERY', icon: '✒️', productCount: 11, description: 'Sổ tay bìa da may chỉ, bút ký kim loại khắc tên theo yêu cầu' },
  ],
  'spe-09': [
    { id: 'cat-lego', name: 'Lắp Ghép & Lego', code: 'LEGO', icon: '🧱', productCount: 12, description: 'Bộ xếp hình kiến trúc, lego siêu xe kỹ thuật cao, puzzle gỗ tư duy' },
    { id: 'cat-gau-bong', name: 'Búp Bê & Thú Bông', code: 'PLUSH_TOYS', icon: '🧸', productCount: 10, description: 'Gấu bông Capybara mềm mịn, búp bê vải thêu tay an toàn cho bé' },
    { id: 'cat-xe-dieu-khien', name: 'Xe Mô Hình & Điều Khiển', code: 'RC_CARS', icon: '🏎️', productCount: 11, description: 'Xe đua điều khiển từ xa vượt địa hình, flycam mini có camera' },
    { id: 'cat-do-choi-tri-tue', name: 'Đồ Chơi Trí Tuệ & Bảng Vẽ', code: 'SMART_TOYS', icon: '🎨', productCount: 10, description: 'Bảng vẽ điện tử LCD tự xóa, cờ tỷ phú gia đình, bộ đồ chơi khoa học' },
  ],
  'spe-10': [
    { id: 'cat-ban-ghe', name: 'Bàn Ghế Công Thái Học', code: 'ERGONOMIC', icon: '🪑', productCount: 11, description: 'Ghế xoay công thái học bảo vệ cột sống, bàn làm việc nâng hạ điện thông minh' },
    { id: 'cat-ke-tu', name: 'Kệ & Tủ Trang Trí', code: 'SHELVES', icon: '🗄️', productCount: 10, description: 'Kệ sách gỗ khung sắt, kệ giày đa năng, tủ đầu giường phong cách Bắc Âu' },
    { id: 'cat-den-decor', name: 'Đèn Decor Nghệ Thuật', code: 'DECOR_LAMPS', icon: '🛋️', productCount: 11, description: 'Đèn cây đứng phòng khách, đèn thả trần vintage, đèn hoàng hôn sống ảo' },
    { id: 'cat-tham-tranh', name: 'Thảm Sàn & Tranh Treo Tường', code: 'CARPETS_ARTS', icon: '🖼️', productCount: 10, description: 'Thảm lông cừu trải sàn êm ái, bộ tranh canvas trừu tượng hiện đại' },
  ],
};

// Realistic product images catalog
const PRODUCT_IMAGES = {
  fashion_ao: [
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
  ],
  fashion_quan: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=400&q=80',
  ],
  fashion_vay: [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80',
  ],
  fashion_khoac: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
  ],
  fashion_giay: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=400&q=80',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
  ],
  electronics: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80',
  ],
  food: [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  ],
  home: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
  ],
  books: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
  ],
  toys: [
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
  ],
};

function getSampleImage(categoryCode, index) {
  let list = PRODUCT_IMAGES.fashion_ao;
  if (categoryCode.includes('AO')) list = PRODUCT_IMAGES.fashion_ao;
  else if (categoryCode.includes('QUAN')) list = PRODUCT_IMAGES.fashion_quan;
  else if (categoryCode.includes('VAY')) list = PRODUCT_IMAGES.fashion_vay;
  else if (categoryCode.includes('KHOAC')) list = PRODUCT_IMAGES.fashion_khoac;
  else if (categoryCode.includes('GIAY') || categoryCode.includes('SNEAKER') || categoryCode.includes('SANDAL')) list = PRODUCT_IMAGES.fashion_giay;
  else if (categoryCode.includes('SKIN') || categoryCode.includes('SON') || categoryCode.includes('KCN') || categoryCode.includes('MAT_NA') || categoryCode.includes('LAM_SACH')) list = PRODUCT_IMAGES.beauty;
  else if (categoryCode.includes('PHONE') || categoryCode.includes('LAPTOP') || categoryCode.includes('AUDIO') || categoryCode.includes('KEYBOARD') || categoryCode.includes('SMARTHOME')) list = PRODUCT_IMAGES.electronics;
  else if (categoryCode.includes('CASE') || categoryCode.includes('CHARGER') || categoryCode.includes('SCREEN') || categoryCode.includes('EARPHONES')) list = PRODUCT_IMAGES.accessories;
  else if (categoryCode.includes('FRUITS') || categoryCode.includes('VEGETABLES') || categoryCode.includes('NUTS') || categoryCode.includes('TEA')) list = PRODUCT_IMAGES.food;
  else if (categoryCode.includes('KITCHEN') || categoryCode.includes('CLEANING') || categoryCode.includes('LIGHTING') || categoryCode.includes('BATHROOM') || categoryCode.includes('ERGONOMIC') || categoryCode.includes('SHELVES') || categoryCode.includes('DECOR') || categoryCode.includes('CARPETS')) list = PRODUCT_IMAGES.home;
  else if (categoryCode.includes('BOOK') || categoryCode.includes('STATIONERY') || categoryCode.includes('LITERATURE') || categoryCode.includes('SELF_HELP')) list = PRODUCT_IMAGES.books;
  else if (categoryCode.includes('LEGO') || categoryCode.includes('TOY') || categoryCode.includes('RC_CARS') || categoryCode.includes('SMART_TOYS')) list = PRODUCT_IMAGES.toys;

  return list[index % list.length];
}

// 10-15 product templates per category
const CATEGORY_PRODUCTS_TEMPLATES = {
  // SPE-01 Thời trang nữ Bella
  'cat-ao': [
    { name: 'Áo Sơ Mi Nữ Lụa Satin Cổ Đức Phong Cách Công Sở', sku: 'BELLA-AO-001', price: 299000, orig: 450000, rating: 4.8 },
    { name: 'Áo Thun Baby Tee Cotton 100% Co Giãn 4 Chiều In Họa Tiết', sku: 'BELLA-AO-002', price: 159000, orig: 249000, rating: 4.9 },
    { name: 'Áo Croptop Cổ Vuông Tay Phồng Bo Chun Eo Tiểu Thư', sku: 'BELLA-AO-003', price: 219000, orig: 350000, rating: 4.7 },
    { name: 'Áo Sơ Mi Oversize Form Rộng Dài Tay Giấu Quần Cá Tính', sku: 'BELLA-AO-004', price: 320000, orig: 480000, rating: 4.6 },
    { name: 'Áo Kiểu Nữ Peplum Cổ Chữ V Tôn Dáng Che Khuyết Điểm', sku: 'BELLA-AO-005', price: 279000, orig: 390000, rating: 4.8 },
    { name: 'Áo Len Dệt Kim Mỏng Cổ Lọ Hàn Quốc Mùa Thu Đông', sku: 'BELLA-AO-006', price: 245000, orig: 370000, rating: 4.5 },
    { name: 'Áo Trễ Vai Xếp Nếp Duyên Dáng Dự Tiệc Hẹn Hò', sku: 'BELLA-AO-007', price: 289000, orig: 420000, rating: 4.9 },
    { name: 'Áo Polo Nữ Thêu Logo Tinh Tế Phong Cách Năng Động', sku: 'BELLA-AO-008', price: 199000, orig: 290000, rating: 4.7 },
    { name: 'Áo Hai Dây Lụa Viền Ren Phối Áo Khoác Dễ Thương', sku: 'BELLA-AO-009', price: 139000, orig: 210000, rating: 4.4 },
    { name: 'Áo Sơ Mi Kẻ Sọc Dáng Rộng Vintage Thoáng Mát', sku: 'BELLA-AO-010', price: 265000, orig: 380000, rating: 4.8 },
    { name: 'Áo Blouse Voan Nơ Cổ Dài Tay Nữ Tính Công Sở', sku: 'BELLA-AO-011', price: 310000, orig: 450000, rating: 4.6 },
    { name: 'Áo Thun Dài Tay Cổ Tròn Dáng Ôm Giữ Nhiệt Tối Giản', sku: 'BELLA-AO-012', price: 179000, orig: 260000, rating: 4.8 },
  ],
  'cat-quan': [
    { name: 'Quần Jean Nữ Ống Suông Lưng Cao Hack Chân Dài', sku: 'BELLA-QN-001', price: 389000, orig: 550000, rating: 4.9 },
    { name: 'Quần Culottes Vải Linen Thoáng Mát Đi Làm Đi Chơi', sku: 'BELLA-QN-002', price: 299000, orig: 420000, rating: 4.7 },
    { name: 'Quần Tây Nữ Ống Đứng 1 Ly Công Sở Tôn Dáng', sku: 'BELLA-QN-003', price: 349000, orig: 490000, rating: 4.8 },
    { name: 'Quần Baggy Jean Nữ Cạp Cao Màu Xanh Nhạt Cá Tính', sku: 'BELLA-QN-004', price: 369000, orig: 520000, rating: 4.6 },
    { name: 'Quần Short Jean Nữ Rách Gấu Vintage Mùa Hè', sku: 'BELLA-QN-005', price: 219000, orig: 320000, rating: 4.8 },
    { name: 'Quần Ống Loe Nữ Co Giãn Định Hình Phong Cách Retro', sku: 'BELLA-QN-006', price: 379000, orig: 540000, rating: 4.5 },
    { name: 'Quần Jogger Nữ Thun Da Cá Bo Gấu Tập Gym Năng Động', sku: 'BELLA-QN-007', price: 259000, orig: 360000, rating: 4.7 },
    { name: 'Quần Kaki Ống Rộng Lưng Chun Phía Sau Thoải Mái', sku: 'BELLA-QN-008', price: 289000, orig: 410000, rating: 4.6 },
    { name: 'Quần Legging Nữ Nâng Mông Cạp Cao Dệt Liền Mạch', sku: 'BELLA-QN-009', price: 189000, orig: 270000, rating: 4.9 },
    { name: 'Quần Ống Rộng Suông Vải Đũi Tự Nhiên Dễ Phối Đồ', sku: 'BELLA-QN-010', price: 269000, orig: 390000, rating: 4.4 },
    { name: 'Quần Jean Nữ Trắng Dáng Ôm Slimfit Co Giãn Cao', sku: 'BELLA-QN-011', price: 359000, orig: 510000, rating: 4.7 },
  ],
  'cat-vay-dam': [
    { name: 'Đầm Maxi Hoa Nhí Đi Biển Dáng Xòe Bồng Thướt Tha', sku: 'BELLA-VD-001', price: 429000, orig: 650000, rating: 4.9 },
    { name: 'Váy Chữ A Xếp Ly Phối Đai Eo Tôn Dáng Thanh Lịch', sku: 'BELLA-VD-002', price: 359000, orig: 520000, rating: 4.8 },
    { name: 'Đầm Body Dự Tiệc Cổ V Khoét Lưng Quyến Rũ Sang Trọng', sku: 'BELLA-VD-003', price: 499000, orig: 750000, rating: 4.7 },
    { name: 'Váy Midi Vintage Dài Qua Gối Dáng Suông Dễ Mặc', sku: 'BELLA-VD-004', price: 339000, orig: 490000, rating: 4.6 },
    { name: 'Đầm Babydoll Dáng Rộng Phối Ren Dễ Thương Che Bụng', sku: 'BELLA-VD-005', price: 279000, orig: 390000, rating: 4.8 },
    { name: 'Chân Váy Bút Chì Công Sở Xẻ Tà Trước Tinh Tế', sku: 'BELLA-VD-006', price: 249000, orig: 360000, rating: 4.7 },
    { name: 'Chân Váy Xòe Tennis Xếp Ly Cạp Cao Phong Cách Hàn', sku: 'BELLA-VD-007', price: 199000, orig: 290000, rating: 4.9 },
    { name: 'Đầm Dạ Hội Dáng Dài Đính Kim Sa Lấp Lánh Quý Phái', sku: 'BELLA-VD-008', price: 689000, orig: 990000, rating: 4.5 },
    { name: 'Váy Yếm Jean Nữ Phối Áo Thun Trẻ Trung Cá Tính', sku: 'BELLA-VD-009', price: 389000, orig: 560000, rating: 4.6 },
    { name: 'Đầm Suông Đuôi Cá Tay Ngắn Vải Voan 2 Lớp Mát Mẻ', sku: 'BELLA-VD-010', price: 319000, orig: 460000, rating: 4.8 },
    { name: 'Chân Váy Dài Tầng Voan Xòe Nhẹ Nhàng Tiểu Thư', sku: 'BELLA-VD-011', price: 289000, orig: 410000, rating: 4.7 },
    { name: 'Đầm Ôm Body Nữ Dài Tay Cổ Lọ Chất Thun Gân Tôn Dáng', sku: 'BELLA-VD-012', price: 269000, orig: 380000, rating: 4.6 },
  ],
  'cat-ao-khoac': [
    { name: 'Áo Khoác Blazer Nữ 2 Lớp Dáng Rộng Hàn Quốc Cao Cấp', sku: 'BELLA-AK-001', price: 589000, orig: 850000, rating: 4.9 },
    { name: 'Áo Khoác Dạ Tweed Dệt Kim Kim Tuyến Sang Chảnh', sku: 'BELLA-AK-002', price: 649000, orig: 950000, rating: 4.8 },
    { name: 'Áo Cardigan Nữ Dệt Kim Len Mềm Mịn Họa Tiết Quả Trám', sku: 'BELLA-AK-003', price: 299000, orig: 430000, rating: 4.7 },
    { name: 'Áo Khoác Dù 2 Lớp Chống Gió Chống Nước Form Unisex', sku: 'BELLA-AK-004', price: 329000, orig: 480000, rating: 4.6 },
    { name: 'Áo Phao Lông Vũ Dáng Ngắn Siêu Nhẹ Cực Ấm', sku: 'BELLA-AK-005', price: 699000, orig: 1050000, rating: 4.8 },
    { name: 'Áo Khoác Jean Nữ Rách Bụi Bặm Form Rộng Năng Động', sku: 'BELLA-AK-006', price: 429000, orig: 620000, rating: 4.5 },
    { name: 'Áo Khoác Bomber Da Lộn Lót Lông Cổ Bẻ Cá Tính', sku: 'BELLA-AK-007', price: 549000, orig: 790000, rating: 4.7 },
    { name: 'Áo Hoodie Nữ Form Rộng Nỉ Bông Dày Dặn Unisex', sku: 'BELLA-AK-008', price: 279000, orig: 399000, rating: 4.8 },
    { name: 'Áo Khoác Măng Tô Nữ Dáng Dài Thắt Đai Eo Thời Thượng', sku: 'BELLA-AK-009', price: 799000, orig: 1200000, rating: 4.9 },
    { name: 'Áo Khoác Lửng Len Mỏng Cài Cúc Phối Váy Mùa Thu', sku: 'BELLA-AK-010', price: 239000, orig: 340000, rating: 4.4 },
    { name: 'Áo Blazer Croptop Nữ Tay Lửng Phong Cách Trẻ Trung', sku: 'BELLA-AK-011', price: 459000, orig: 650000, rating: 4.6 },
  ],
  'cat-giay': [
    { name: 'Giày Cao Gót Mũi Nhọn 7cm Da Bóng Sang Trọng Dự Tiệc', sku: 'BELLA-GY-001', price: 399000, orig: 590000, rating: 4.8 },
    { name: 'Giày Sneaker Nữ Thể Thao Đế Bánh Mì Nâng Chiều Cao 5cm', sku: 'BELLA-GY-002', price: 359000, orig: 520000, rating: 4.9 },
    { name: 'Sandal Nữ Quai Mảnh Gót Vuông 5cm Quai Hậu Dễ Đi', sku: 'BELLA-GY-003', price: 289000, orig: 410000, rating: 4.7 },
    { name: 'Dép Nữ Bánh Mì Siêu Nhẹ Đúc Liền Khối Êm Chân', sku: 'BELLA-GY-004', price: 149000, orig: 220000, rating: 4.6 },
    { name: 'Giày Búp Bê Nữ Da Mềm Mũi Tròn Buộc Nơ Xinh Xắn', sku: 'BELLA-GY-005', price: 249000, orig: 360000, rating: 4.8 },
    { name: 'Boot Nữ Cổ Ngắn Da Lì Khóa Kéo Gót Vuông 6cm', sku: 'BELLA-GY-006', price: 479000, orig: 690000, rating: 4.5 },
    { name: 'Giày Loafer Nữ Đế Răng Cưa Đính Khóa Kim Loại Vintage', sku: 'BELLA-GY-007', price: 369000, orig: 530000, rating: 4.7 },
    { name: 'Sandal Chiến Binh Dây Đan Đi Biển Dễ Phối Đồ', sku: 'BELLA-GY-008', price: 219000, orig: 310000, rating: 4.6 },
    { name: 'Giày Thể Thao Nữ Cổ Thấp Trắng Tinh Khôi Đi Học', sku: 'BELLA-GY-009', price: 299000, orig: 440000, rating: 4.9 },
    { name: 'Dép Sục Nữ Da Mềm Quai Hậu 2 Kiểu Đeo Tiện Dụng', sku: 'BELLA-GY-010', price: 269000, orig: 380000, rating: 4.4 },
  ],

  // SPE-02 Mỹ phẩm Hàn Quốc
  'cat-skincare': [
    { name: 'Serum Phục Hồi Da Vitamin B5 & Hyaluronic Acid 30ml', sku: 'MPHQ-SK-001', price: 349000, orig: 520000, rating: 4.9 },
    { name: 'Tinh Chất Dưỡng Trắng Mờ Thâm Vitamin C Pure 15% 20ml', sku: 'MPHQ-SK-002', price: 419000, orig: 620000, rating: 4.8 },
    { name: 'Kem Dưỡng Ẩm Cica Rau Má Phục Hồi Hàng Rào Bảo Vệ Da', sku: 'MPHQ-SK-003', price: 310000, orig: 460000, rating: 4.7 },
    { name: 'Serum Chống Lão Hóa Retinol 0.5% Vi Nang Dịu Nhẹ', sku: 'MPHQ-SK-004', price: 489000, orig: 720000, rating: 4.6 },
    { name: 'Toner Cân Bằng Độ Ẩm Chiết Xuất Tràm Trà Trị Mụn 200ml', sku: 'MPHQ-SK-005', price: 239000, orig: 350000, rating: 4.8 },
    { name: 'Kem Dưỡng Mắt Giảm Thâm Quầng Bọng Mắt Peptide 25ml', sku: 'MPHQ-SK-006', price: 289000, orig: 420000, rating: 4.5 },
    { name: 'Essence Dưỡng Ẩm Chuyên Sâu Chiết Xuất Ốc Sên 100ml', sku: 'MPHQ-SK-007', price: 379000, orig: 550000, rating: 4.9 },
    { name: 'Dầu Dưỡng Da Squalane 100% Thuần Chay Cấp Ẩm Khóa Nước', sku: 'MPHQ-SK-008', price: 330000, orig: 490000, rating: 4.7 },
    { name: 'Serum Se Khít Lỗ Chân Lông Niacinamide 10% + Zinc 1%', sku: 'MPHQ-SK-009', price: 269000, orig: 390000, rating: 4.8 },
    { name: 'Xịt Khoáng Cấp Ẩm Tức Thì Nước Băng Bắc Cực 150ml', sku: 'MPHQ-SK-010', price: 169000, orig: 250000, rating: 4.6 },
    { name: 'Gel Chấm Mụn Cấp Tốc Gom Cồi Trong 12H Salicylic Acid', sku: 'MPHQ-SK-011', price: 199000, orig: 290000, rating: 4.8 },
    { name: 'Bộ Kit Skincare Mini Trải Nghiệm 4 Bước Dưỡng Trắng', sku: 'MPHQ-SK-012', price: 299000, orig: 450000, rating: 4.7 },
  ],
  'cat-son-moi': [
    { name: 'Son Kem Lì Mịn Mượt Velvet Lip Tint Bền Màu 8 Tiếng', sku: 'MPHQ-SM-001', price: 189000, orig: 280000, rating: 4.9 },
    { name: 'Son Tint Bóng Căng Mọng Thuần Chay Hiệu Ứng Thủy Tinh', sku: 'MPHQ-SM-002', price: 219000, orig: 320000, rating: 4.8 },
    { name: 'Son Thỏi Lì Cao Cấp Nhẹ Môi Không Lộ Vân Môi', sku: 'MPHQ-SM-003', price: 259000, orig: 380000, rating: 4.7 },
    { name: 'Son Dưỡng Có Màu Dầu Bơ Shea Butter Chống Thâm Môi', sku: 'MPHQ-SM-004', price: 139000, orig: 200000, rating: 4.8 },
    { name: 'Mặt Nạ Ngủ Cho Môi Chiết Xuất Quả Mọng Berry 20g', sku: 'MPHQ-SM-005', price: 179000, orig: 260000, rating: 4.9 },
    { name: 'Chì Viền Môi Định Hình Dáng Môi Tự Nhiên Chống Lem', sku: 'MPHQ-SM-006', price: 119000, orig: 170000, rating: 4.5 },
    { name: 'Son Bùn Mịn Mờ Che Khuyết Điểm Môi Tươi Sáng', sku: 'MPHQ-SM-007', price: 169000, orig: 250000, rating: 4.6 },
    { name: 'Son Kem Lì Kháng Nước Chống Trôi Khi Ăn Uống', sku: 'MPHQ-SM-008', price: 229000, orig: 340000, rating: 4.7 },
    { name: 'Son Tint Nước Lâu Trôi Tự Nhiên Cho Học Sinh Đi Học', sku: 'MPHQ-SM-009', price: 129000, orig: 190000, rating: 4.8 },
    { name: 'Tẩy Tế Bào Chết Môi Đường Đen Tự Nhiên Dịu Nhẹ', sku: 'MPHQ-SM-010', price: 109000, orig: 160000, rating: 4.6 },
    { name: 'Set 3 Cây Son Mini Màu Hot Trend Hộp Quà Tặng Xinh Xắn', sku: 'MPHQ-SM-011', price: 349000, orig: 520000, rating: 4.9 },
  ],
  'cat-chong-nang': [
    { name: 'Kem Chống Nắng Nâng Tone Kiềm Dầu SPF50+ PA++++ 50ml', sku: 'MPHQ-CN-001', price: 289000, orig: 420000, rating: 4.9 },
    { name: 'Sữa Chống Nắng Kháng Nước Cho Da Nhạy Cảm 50ml', sku: 'MPHQ-CN-002', price: 329000, orig: 480000, rating: 4.8 },
    { name: 'Thỏi Lăn Chống Nắng Tiện Dụng Bỏ Túi Dễ Thoa Lại 20g', sku: 'MPHQ-CN-003', price: 249000, orig: 360000, rating: 4.7 },
    { name: 'Xịt Chống Nắng Phun Sương Trong Suốt Toàn Thân 150ml', sku: 'MPHQ-CN-004', price: 219000, orig: 320000, rating: 4.6 },
    { name: 'Kem Chống Nắng Vật Lý Chiết Xuất Tràm Trà Giảm Mụn', sku: 'MPHQ-CN-005', price: 279000, orig: 400000, rating: 4.8 },
    { name: 'Gel Chống Nắng Dưỡng Ẩm Thấm Nhanh Không Bết Rít 60ml', sku: 'MPHQ-CN-006', price: 269000, orig: 390000, rating: 4.7 },
    { name: 'Kem Chống Nắng Phổ Rộng Bảo Vệ Khỏi Ánh Sáng Xanh', sku: 'MPHQ-CN-007', price: 359000, orig: 530000, rating: 4.8 },
    { name: 'Phấn Nước Cushion Chống Nắng Tích Hợp Che Phủ Mỏng Nhẹ', sku: 'MPHQ-CN-008', price: 389000, orig: 570000, rating: 4.5 },
    { name: 'Kem Chống Nắng Dành Riêng Cho Da Khô Hyaluronic Acid', sku: 'MPHQ-CN-009', price: 299000, orig: 440000, rating: 4.7 },
    { name: 'Kem Dưỡng Thể Chống Nắng Ban Ngày Dưỡng Trắng Body 200ml', sku: 'MPHQ-CN-010', price: 259000, orig: 380000, rating: 4.6 },
  ],

  // SPE-03 Điện tử thông minh
  'cat-dien-thoai': [
    { name: 'Điện Thoại 5G Pro Max 256GB Màn Hình AMOLED 120Hz', sku: 'DTTU-DT-001', price: 12490000, orig: 15990000, rating: 4.9 },
    { name: 'Smartphone Màn Hình Gập Độc Đáo Siêu Mỏng Nhẹ 128GB', sku: 'DTTU-DT-002', price: 18900000, orig: 23500000, rating: 4.7 },
    { name: 'Điện Thoại Gaming Chip Snapdragon 8 Gen 3 Tản Nhiệt Nước', sku: 'DTTU-DT-003', price: 14200000, orig: 17500000, rating: 4.8 },
    { name: 'Máy Tính Bảng 11 Inch Kèm Bút Cảm Ứng Pin 8000mAh', sku: 'DTTU-DT-004', price: 7890000, orig: 9990000, rating: 4.8 },
    { name: 'Điện Thoại Tầm Trung Pin Khủng 6000mAh Sạc Nhanh 67W', sku: 'DTTU-DT-005', price: 4990000, orig: 6490000, rating: 4.6 },
    { name: 'Smartphone Chụp Ảnh Chân Dung Chuyên Nghiệp 108MP OIS', sku: 'DTTU-DT-006', price: 8490000, orig: 10900000, rating: 4.7 },
    { name: 'Tablet Mini 8.4 Inch Cầm Vừa Tay Đọc Sách Xem Phim', sku: 'DTTU-DT-007', price: 4290000, orig: 5500000, rating: 4.5 },
    { name: 'Điện Thoại Phổ Thông Pin Bền 2 Sim Nghe Gọi Rõ Ràng', sku: 'DTTU-DT-008', price: 690000, orig: 990000, rating: 4.8 },
    { name: 'Giá Đỡ Điện Thoại Tích Hợp Sạc Không Dây MagSafe 15W', sku: 'DTTU-DT-009', price: 450000, orig: 690000, rating: 4.7 },
    { name: 'Bút Cảm Ứng Stylus Đa Năng Cho Mọi Dòng Máy Tính Bảng', sku: 'DTTU-DT-010', price: 390000, orig: 580000, rating: 4.6 },
    { name: 'Gậy Chụp Hình Gimbal Chống Rung 3 Trục Quay Video AI', sku: 'DTTU-DT-011', price: 1290000, orig: 1890000, rating: 4.8 },
    { name: 'Miếng Dán Màn Hình Ceramic Tự Phục Hồi Vết Xước', sku: 'DTTU-DT-012', price: 120000, orig: 180000, rating: 4.5 },
  ],
  'cat-am-thanh': [
    { name: 'Tai Nghe Bluetooth Chống Ồn Chủ Động ANC Pin 40 Giờ', sku: 'DTTU-AT-001', price: 1190000, orig: 1800000, rating: 4.9 },
    { name: 'Tai Nghe True Wireless TWS Âm Bass Trầm Sâu Kháng Nước IPX7', sku: 'DTTU-AT-002', price: 690000, orig: 1100000, rating: 4.8 },
    { name: 'Loa Bluetooth Di Động Công Suất 30W Đèn LED Nháy Theo Nhạc', sku: 'DTTU-AT-003', price: 890000, orig: 1390000, rating: 4.7 },
    { name: 'Tai Nghe Chụp Tai Gaming 7.1 Surround Có Mic Lọc Tạp Âm', sku: 'DTTU-AT-004', price: 750000, orig: 1150000, rating: 4.8 },
    { name: 'Loa Soundbar Đặt Bàn Máy Tính Kèm Subwoofer Xem Phim Cực Đỉnh', sku: 'DTTU-AT-005', price: 1450000, orig: 2200000, rating: 4.6 },
    { name: 'Micro Thu Âm Cài Áo Không Dây Thu Âm Vlogger Chống Ồn', sku: 'DTTU-AT-006', price: 590000, orig: 890000, rating: 4.7 },
    { name: 'Tai Nghe Dẫn Truyền Qua Xương Chạy Bộ Thể Thao An Toàn', sku: 'DTTU-AT-007', price: 980000, orig: 1500000, rating: 4.5 },
    { name: 'Loa Kẹo Kéo Bluetooth Mini Hát Karaoke Tặng Kèm 2 Mic', sku: 'DTTU-AT-008', price: 1690000, orig: 2500000, rating: 4.6 },
    { name: 'Tai Nghe In-Ear Có Dây Chân Type-C Âm Thanh Hi-Res Chuẩn', sku: 'DTTU-AT-009', price: 189000, orig: 290000, rating: 4.8 },
    { name: 'DAC Giải Mã Âm Thanh Rời Mini Cho Điện Thoại & Laptop', sku: 'DTTU-AT-010', price: 420000, orig: 650000, rating: 4.7 },
    { name: 'Giá Treo Tai Nghe Kim Loại Có Cổng Sạc USB & Đèn RGB', sku: 'DTTU-AT-011', price: 290000, orig: 450000, rating: 4.5 },
    { name: 'Đệm Tai Thay Thế Bằng Da Protein Mềm Mại Cho Tai Nghe', sku: 'DTTU-AT-012', price: 95000, orig: 150000, rating: 4.8 },
  ],
};

// Natural Vietnamese customer names generator
const VIETNAMESE_NAMES = [
  'nguyen_thanh_huyen', 'hoanglong_hn', 'tranminhduc96', 'mai_anh_le', 'phuongthao.vu',
  't***9', 'nguyenvana_hcm', 'hoanganh_92', 'bichngoc_da_nang', 'quanghuy_k3',
  'le_thi_kim_ngan', 'h***h', 'ducthuan_it', 'lanhuong_beauty', 'minhtri_review',
  'thanhhang.official', 'm***2', 'haidang_vlog', 'thuylinh_pham', 'hoangnam_dn',
  'k***0', 'phuocloc_saigon', 'anhthu_nguyen', 'trandinhkhanh', 'dieumy_99',
  'n***5', 'vovanphuc', 'ngocmai_le', 'dinhquang_auto', 'thuyduong.art',
  's***8', 'huynhnhu_fashion', 'baotran_sweet', 'truonggiang_dev', 'quynhnga_95',
  'v***7', 'tuananh_hust', 'kimchi_korea', 'viethoang_ptit', 'thanhthuy_bn',
];

// Product review comments generator (generates 50-100 realistic comments per product)
export function generateMockComments(product, count = 75) {
  const isClothing = product.categoryId?.includes('ao') || product.categoryId?.includes('quan') || product.categoryId?.includes('vay') || product.categoryId?.includes('khoac') || product.categoryId?.includes('giay');
  const isBeauty = product.categoryId?.includes('skincare') || product.categoryId?.includes('son') || product.categoryId?.includes('chong-nang') || product.categoryId?.includes('lam-sach') || product.categoryId?.includes('mat-na');
  const isTech = product.categoryId?.includes('dien-thoai') || product.categoryId?.includes('am-thanh') || product.categoryId?.includes('laptop') || product.categoryId?.includes('smarthome') || product.categoryId?.includes('phu-kien');

  // Realistic comment templates by domain & sentiment
  const templates = {
    clothing: {
      POS: [
        { text: 'Chất vải dày dặn, sờ rất mát tay và không nhăn sau khi giặt. Đường may tỉ mỉ không có chỉ thừa nào. Form lên người chuẩn y hình mẫu!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'POS' }, { aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'POS' }] },
        { text: 'Mặc đi làm ai cũng khen xinh. Vải lụa mềm mướt không bí rít chút nào. Shop tư vấn nhiệt tình chuẩn size, đóng gói cẩn thận hộp cứng cáp.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'POS' }, { aspect: 'Consulting_Attitude', label: 'Thái độ tư vấn Shop', sentiment: 'POS' }] },
        { text: 'Đáng tiền cực kỳ luôn mọi người ơi! Mua đợt sale áp mã được giảm sâu, chất lượng vượt xa mong đợi. Giao hàng hỏa tốc trong ngày!', aspects: [{ aspect: 'Price_Performance_Ratio', label: 'Mức độ đáng tiền (P/P)', sentiment: 'POS' }, { aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'POS' }] },
        { text: 'Đã mua lần thứ 3 ở shop rồi vẫn ưng ý 100%. Vải co giãn thoải mái, màu sắc giống hình mô tả 99%. Sẽ tiếp tục ủng hộ shop lâu dài!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'POS' }, { aspect: 'Overall_Sentiment', label: 'Đánh giá chung', sentiment: 'POS' }] },
        { text: 'Form dáng tôn eo che khuyết điểm rất tốt, mặc lên nhìn thon gọn hẳn. Đóng gói đẹp có túi zip thơm phức, shipper dễ thương.', aspects: [{ aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'POS' }, { aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'POS' }] },
      ],
      NEU: [
        { text: 'Vải khá ổn so với mức giá này, tuy nhiên màu bên ngoài hơi tối hơn trong ảnh một xíu. Mặc vừa người, tạm ổn trong phân khúc.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'NEU' }, { aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'NEU' }] },
        { text: 'Giao hàng mất gần 4 ngày mới tới nơi, áo có sót chút chỉ thừa ở cổ tay nhưng tự cắt được. Nhìn chung tiền nào của nấy.', aspects: [{ aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'NEU' }, { aspect: 'Price_Performance_Ratio', label: 'Mức độ đáng tiền (P/P)', sentiment: 'NEU' }] },
        { text: 'Chất liệu tạm được, mặc vào mùa hè thì hơi dày một chút còn mùa thu thì hợp. Size vừa khít nên ai thích mặc rộng nên tăng 1 size.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'NEU' }] },
        { text: 'Sản phẩm đóng gói túi bóng bình thường, không có hộp. Áo form basic dễ phối đồ, chất lượng trung bình khá.', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'NEU' }] },
      ],
      NEG: [
        { text: 'Chất vải mỏng hơn tưởng tượng, giặt máy một lần đã bị xù lông nhẹ ở mép áo. Hơi thất vọng so với quảng cáo.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'NEG' }] },
        { text: 'Giao hàng quá chậm, mất cả tuần mới nhận được. Nhắn tin hỏi shop thì phản hồi rất hờ hững tự động không giải quyết được gì.', aspects: [{ aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'NEG' }, { aspect: 'Response_Time', label: 'Tốc độ phản hồi Shop', sentiment: 'NEG' }] },
        { text: 'Bảng size không chuẩn, mình đặt size L theo hướng dẫn mà mặc vào chật cứng không thở nổi. Muốn đổi size mà quy trình phức tạp quá.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'NEG' }, { aspect: 'AfterSales_Complaint', label: 'Xử lý bảo hành & Đổi trả', sentiment: 'NEG' }] },
      ],
    },
    beauty: {
      POS: [
        { text: 'Dùng hết 1 lọ rồi quay lại mua thêm. Da ẩm mượt thấy rõ, không bị kích ứng hay nổi mụn li ti. Chất serum thấm cực nhanh không nhờn dính!', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'POS' }] },
        { text: 'Hàng chính hãng có tem phụ tiếng Việt và mã cào kiểm tra chống giả. Đóng gói bong bóng chống sốc dày dặn nhiều lớp rất có tâm!', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Chính hãng & Tem nhãn', sentiment: 'POS' }, { aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'POS' }] },
        { text: 'Mùi hương thoang thoảng dịu nhẹ tự nhiên, thoa lên da nâng tone trắng hồng căng bóng chuẩn gái Hàn. Rất đáng đồng tiền bát gạo!', aspects: [{ aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Mức độ đáng tiền (P/P)', sentiment: 'POS' }] },
        { text: 'Shop tặng kèm nhiều sample dùng thử siêu thích! Giao hàng siêu tốc trong 24h, tư vấn nhiệt tình giải thích từng loại da cụ thể.', aspects: [{ aspect: 'Consulting_Attitude', label: 'Thái độ tư vấn Shop', sentiment: 'POS' }, { aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'POS' }] },
      ],
      NEU: [
        { text: 'Mới dùng được 3 ngày chưa thấy tác dụng rõ rệt, để dùng thêm một thời gian xem thế nào. Cảm giác bôi lên da mát mát dễ chịu.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'NEU' }] },
        { text: 'Chất kem hơi đặc nên cần tán nhanh tay kẻo vệt trắng, bù lại kiềm dầu ổn định được tầm 4 tiếng. Giá cả vừa túi tiền sinh viên.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'NEU' }, { aspect: 'Price_Promotion', label: 'Giá bán & Khuyến mãi', sentiment: 'NEU' }] },
        { text: 'Sản phẩm date xa 2028, tuy nhiên vòi pump hơi cứng khi ấn lần đầu. Tạm hài lòng với mức giá sale.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'NEU' }] },
      ],
      NEG: [
        { text: 'Da mình dùng bị châm chích ngứa rát nhẹ quanh cánh mũi. Có lẽ sản phẩm không phù hợp với da quá nhạy cảm.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'NEG' }, { aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'NEG' }] },
        { text: 'Hộp giấy bên ngoài bị móp méo rách góc trong quá trình vận chuyển. May là chai thủy tinh bên trong không vỡ nhưng nhìn mất thẩm mỹ.', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'NEG' }] },
        { text: 'Son lên màu không giống swatch trên hình của shop, màu thực tế ngả tím nhiều hơn. Đánh lên hơi khô môi.', aspects: [{ aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'NEG' }] },
      ],
    },
    tech: {
      POS: [
        { text: 'Chất âm cực đỉnh trong tầm giá! Âm bass chắc nịch không bị rè ở âm lượng lớn, tính năng chống ồn ANC hoạt động hiệu quả bất ngờ!', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Mức độ đáng tiền (P/P)', sentiment: 'POS' }] },
        { text: 'Hàng nguyên seal mới 100%, bảo hành điện tử kích hoạt chuẩn ngày nhận. Pin trâu dùng liên tục 3 ngày mới phải sạc lại!', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Chính hãng & Tem nhãn', sentiment: 'POS' }, { aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'POS' }] },
        { text: 'Thiết kế đẹp mắt, hoàn thiện kim loại cao cấp cầm đầm tay. Kết nối Bluetooth nhanh như chớp, độ trễ cực thấp chơi game rất mượt.', aspects: [{ aspect: 'Appearance_Design', label: 'Kiểu dáng & Mẫu mã', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'POS' }] },
        { text: 'Shop hỗ trợ kỹ thuật qua Zalo cực kỳ nhiệt tình và chuyên nghiệp. Đóng thùng carton có chèn xốp bóng khí dày cộp an tâm tuyệt đối.', aspects: [{ aspect: 'Consulting_Attitude', label: 'Thái độ tư vấn Shop', sentiment: 'POS' }, { aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'POS' }] },
      ],
      NEU: [
        { text: 'Dùng ổn trong tầm giá này. Kết nối đôi lúc bị chập chờn khi cách xa trên 8 mét hoặc có vật cản tường. Pin được khoảng 5-6 tiếng.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'NEU' }] },
        { text: 'Micro đàm thoại mức độ tạm chấp nhận, ngoài đường gió to thì bên kia nghe hơi nhỏ. Phần mềm đi kèm giao diện hơi khó dùng chút.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm sử dụng', sentiment: 'NEU' }] },
        { text: 'Thời gian giao hàng hơi lâu hơn dự kiến 2 ngày nhưng bù lại shipper gọi điện trước lịch sự. Sản phẩm đúng như mô tả.', aspects: [{ aspect: 'Delivery_Speed', label: 'Tốc độ giao hàng', sentiment: 'NEU' }] },
      ],
      NEG: [
        { text: 'Dùng được đúng 2 tuần thì tai bên phải bị mất tiếng chập chờn. Liên hệ gửi bảo hành thì quy trình rườm rà bắt đợi kiểm tra lâu.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu & Độ bền', sentiment: 'NEG' }, { aspect: 'AfterSales_Complaint', label: 'Xử lý bảo hành & Đổi trả', sentiment: 'NEG' }] },
        { text: 'Quảng cáo sạc nhanh 65W nhưng cắm sạc thực tế chỉ nhận 25-30W, củ sạc rất nóng sau 30 phút sử dụng liên tục.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng & Chức năng', sentiment: 'NEG' }] },
        { text: 'Hộp sản phẩm bị rách niêm phong seal từ trước khi giao, cảm giác như hàng đã bị bóc ra xem. Hỏi shop thì không nhận được câu trả lời thỏa đáng.', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Chính hãng & Tem nhãn', sentiment: 'NEG' }, { aspect: 'Response_Time', label: 'Tốc độ phản hồi Shop', sentiment: 'NEG' }] },
      ],
    },
  };

  const domain = isClothing ? 'clothing' : isBeauty ? 'beauty' : 'tech';
  const domainTemplates = templates[domain] || templates.clothing;

  const comments = [];
  const variants = [
    'Màu Sắc: Đen, Kích thước: Size L',
    'Màu Sắc: Trắng Tinh Khôi, Kích thước: Size M',
    'Màu Sắc: Be Sữa, Kích thước: Size S',
    'Màu Sắc: Xanh Pastel, Kích thước: Size XL',
    'Phân loại: Bản Tiêu Chuẩn 50ml',
    'Phân loại: Combo Tiết Kiệm Kèm Quà Tặng',
    'Phân loại: Bản Cao Cấp Màu Xám Không Gian',
    'Phân loại: Màu Bạc Ánh Kim, 128GB',
  ];

  // Target sentiment distribution based on product rating
  const targetPosCount = Math.round(count * (product.rating >= 4.8 ? 0.76 : product.rating >= 4.6 ? 0.70 : 0.60));
  const targetNeuCount = Math.round(count * 0.16);
  const targetNegCount = count - targetPosCount - targetNeuCount;

  const sentimentPool = [];
  for (let i = 0; i < targetPosCount; i++) sentimentPool.push('POS');
  for (let i = 0; i < targetNeuCount; i++) sentimentPool.push('NEU');
  for (let i = 0; i < targetNegCount; i++) sentimentPool.push('NEG');

  // Shuffle pool deterministically based on product id
  sentimentPool.sort((a, b) => (a.charCodeAt(0) * 17) % 7 - (b.charCodeAt(0) * 13) % 7);

  const baseDate = new Date('2026-08-30T12:00:00Z');

  for (let i = 0; i < count; i++) {
    const sentiment = sentimentPool[i] || 'POS';
    const pool = domainTemplates[sentiment];
    const template = pool[i % pool.length];

    const starRating = sentiment === 'POS' ? ((i % 4 === 0) ? 4 : 5)
      : sentiment === 'NEU' ? 3
      : ((i % 3 === 0) ? 1 : 2);

    const dateOffsetHours = (count - i) * 6.5 + (i % 5);
    const commentDate = new Date(baseDate.getTime() - dateOffsetHours * 3600 * 1000);

    const userName = VIETNAMESE_NAMES[i % VIETNAMESE_NAMES.length];
    const variant = variants[i % variants.length];

    comments.push({
      id: `cmt-${product.id}-${String(i + 1).padStart(3, '0')}`,
      productId: product.id,
      userName,
      avatarChar: userName.charAt(0).toUpperCase(),
      avatarColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6],
      starRating,
      sentiment, // 'POS' | 'NEU' | 'NEG'
      date: commentDate.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      variant,
      content: template.text,
      aspects: template.aspects,
      helpfulVotes: (i * 7) % 29,
    });
  }

  return comments;
}

// Generate products for a specific category
export function getProductsForCategory(storeId, categoryId) {
  const store = SHOPEE_STORES.find((s) => s.id === storeId);
  const categories = STORE_CATEGORIES[storeId] || [];
  const cat = categories.find((c) => c.id === categoryId);

  if (!store || !cat) return [];

  const templates = CATEGORY_PRODUCTS_TEMPLATES[categoryId];

  // If specific templates exist, use them
  if (templates && templates.length > 0) {
    return templates.map((tmpl, idx) => {
      const prodId = `prod-${storeId}-${categoryId}-${idx + 1}`;
      const reviewCount = Math.floor(65 + (idx * 13) % 35); // 65 to 98 reviews
      const image = getSampleImage(cat.code, idx);

      const posRatio = tmpl.rating >= 4.8 ? 0.78 : tmpl.rating >= 4.6 ? 0.70 : 0.60;
      const neuRatio = 0.16;
      const posCount = Math.round(reviewCount * posRatio);
      const neuCount = Math.round(reviewCount * neuRatio);
      const negCount = reviewCount - posCount - neuCount;

      const posPercent = Math.round((posCount / reviewCount) * 100);
      const neuPercent = Math.round((neuCount / reviewCount) * 100);
      const negPercent = 100 - posPercent - neuPercent;

      const productObj = {
        id: prodId,
        storeId,
        storeName: store.name,
        storeBadge: `Shopee Mall - ${store.name}`,
        categoryId,
        categoryName: cat.name,
        name: tmpl.name,
        sku: tmpl.sku,
        price: tmpl.price,
        originalPrice: tmpl.orig,
        rating: tmpl.rating,
        reviewCount,
        image,
        posCount,
        neuCount,
        negCount,
        posPercent,
        neuPercent,
        negPercent,
        aspectBreakdown: [
          { macroCategory: 'PRODUCT', microAspect: 'Material_BuildQuality', posCount: Math.round(posCount * 0.4), neuCount: Math.round(neuCount * 0.3), negCount: Math.round(negCount * 0.4), totalMentions: Math.round(reviewCount * 0.38) },
          { macroCategory: 'PRODUCT', microAspect: 'Usability_Experience', posCount: Math.round(posCount * 0.35), neuCount: Math.round(neuCount * 0.35), negCount: Math.round(negCount * 0.3), totalMentions: Math.round(reviewCount * 0.34) },
          { macroCategory: 'PRODUCT', microAspect: 'Appearance_Design', posCount: Math.round(posCount * 0.25), neuCount: Math.round(neuCount * 0.2), negCount: Math.round(negCount * 0.2), totalMentions: Math.round(reviewCount * 0.24) },
          { macroCategory: 'SHIPPING', microAspect: 'Delivery_Speed', posCount: Math.round(posCount * 0.3), neuCount: Math.round(neuCount * 0.4), negCount: Math.round(negCount * 0.35), totalMentions: Math.round(reviewCount * 0.32) },
          { macroCategory: 'SHIPPING', microAspect: 'External_Packaging', posCount: Math.round(posCount * 0.25), neuCount: Math.round(neuCount * 0.25), negCount: Math.round(negCount * 0.2), totalMentions: Math.round(reviewCount * 0.24) },
          { macroCategory: 'SERVICE', microAspect: 'Consulting_Attitude', posCount: Math.round(posCount * 0.2), neuCount: Math.round(neuCount * 0.15), negCount: Math.round(negCount * 0.1), totalMentions: Math.round(reviewCount * 0.18) },
          { macroCategory: 'PRICE', microAspect: 'Price_Performance_Ratio', posCount: Math.round(posCount * 0.28), neuCount: Math.round(neuCount * 0.2), negCount: Math.round(negCount * 0.15), totalMentions: Math.round(reviewCount * 0.25) },
        ],
      };

      // Attach 50-100 realistic comments
      productObj.comments = generateMockComments(productObj, reviewCount);
      return productObj;
    });
  }

  // Fallback generator for other categories: generates exactly 12 rich items per category
  const result = [];
  const count = 12;
  for (let i = 1; i <= count; i++) {
    const prodId = `prod-${storeId}-${categoryId}-${i}`;
    const price = 150000 + ((i * 73000) % 950000);
    const originalPrice = Math.round(price * 1.45);
    const rating = parseFloat((4.3 + ((i * 7) % 7) / 10).toFixed(1));
    const reviewCount = 65 + (i * 2); // 67 to 89 reviews
    const sku = `${store.code}-${cat.code}-${String(i).padStart(3, '0')}`;
    const image = getSampleImage(cat.code, i);

    const posRatio = rating >= 4.8 ? 0.78 : rating >= 4.6 ? 0.70 : 0.60;
    const neuRatio = 0.16;
    const posCount = Math.round(reviewCount * posRatio);
    const neuCount = Math.round(reviewCount * neuRatio);
    const negCount = reviewCount - posCount - neuCount;

    const posPercent = Math.round((posCount / reviewCount) * 100);
    const neuPercent = Math.round((neuCount / reviewCount) * 100);
    const negPercent = 100 - posPercent - neuPercent;

    const productObj = {
      id: prodId,
      storeId,
      storeName: store.name,
      storeBadge: `Shopee Mall - ${store.name}`,
      categoryId,
      categoryName: cat.name,
      name: `${cat.name} ${store.name} Cao Cấp Chính Hãng Model ${i}`,
      sku,
      price,
      originalPrice,
      rating,
      reviewCount,
      image,
      posCount,
      neuCount,
      negCount,
      posPercent,
      neuPercent,
      negPercent,
      aspectBreakdown: [
        { macroCategory: 'PRODUCT', microAspect: 'Material_BuildQuality', posCount: Math.round(posCount * 0.4), neuCount: Math.round(neuCount * 0.3), negCount: Math.round(negCount * 0.4), totalMentions: Math.round(reviewCount * 0.38) },
        { macroCategory: 'PRODUCT', microAspect: 'Usability_Experience', posCount: Math.round(posCount * 0.35), neuCount: Math.round(neuCount * 0.35), negCount: Math.round(negCount * 0.3), totalMentions: Math.round(reviewCount * 0.34) },
        { macroCategory: 'PRODUCT', microAspect: 'Appearance_Design', posCount: Math.round(posCount * 0.25), neuCount: Math.round(neuCount * 0.2), negCount: Math.round(negCount * 0.2), totalMentions: Math.round(reviewCount * 0.24) },
        { macroCategory: 'SHIPPING', microAspect: 'Delivery_Speed', posCount: Math.round(posCount * 0.3), neuCount: Math.round(neuCount * 0.4), negCount: Math.round(negCount * 0.35), totalMentions: Math.round(reviewCount * 0.32) },
        { macroCategory: 'SHIPPING', microAspect: 'External_Packaging', posCount: Math.round(posCount * 0.25), neuCount: Math.round(neuCount * 0.25), negCount: Math.round(negCount * 0.2), totalMentions: Math.round(reviewCount * 0.24) },
        { macroCategory: 'SERVICE', microAspect: 'Consulting_Attitude', posCount: Math.round(posCount * 0.2), neuCount: Math.round(neuCount * 0.15), negCount: Math.round(negCount * 0.1), totalMentions: Math.round(reviewCount * 0.18) },
        { macroCategory: 'PRICE', microAspect: 'Price_Performance_Ratio', posCount: Math.round(posCount * 0.28), neuCount: Math.round(neuCount * 0.2), negCount: Math.round(negCount * 0.15), totalMentions: Math.round(reviewCount * 0.25) },
      ],
    };

    productObj.comments = generateMockComments(productObj, reviewCount);
    result.push(productObj);
  }

  return result;
}

// Find single product by ID across all stores & categories
export function findShopeeProductById(productId) {
  for (const store of SHOPEE_STORES) {
    const cats = STORE_CATEGORIES[store.id] || [];
    for (const cat of cats) {
      const prods = getProductsForCategory(store.id, cat.id);
      const found = prods.find((p) => p.id === productId);
      if (found) return found;
    }
  }
  return null;
}
