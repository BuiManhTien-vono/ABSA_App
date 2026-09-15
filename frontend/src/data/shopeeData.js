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
export function getProductDomain(product) {
  const name = (product.name || '').toLowerCase();
  const cat = (product.categoryName || '').toLowerCase();
  const fullText = `${product.name || ''} ${product.categoryName || ''} ${product.categoryId || ''} ${product.sku || ''}`.toLowerCase();

  // 1. Beauty & Skincare & Perfume FIRST (Catches "nước hoa", "sáp thơm", "làm đẹp" BEFORE food checks for "trà")
  if (name.includes('nước hoa') || name.includes('sáp thơm') || name.includes('skincare') || name.includes('son') || name.includes('mỹ phẩm') || name.includes('dưỡng da') || name.includes('tẩy trang') || name.includes('mặt nạ') || name.includes('serum') || name.includes('sữa rửa mặt') || cat.includes('làm đẹp') || cat.includes('mỹ phẩm')) {
    return 'beauty';
  }

  // 2. Apparel / Clothing / Accessories
  if (name.includes('áo') || name.includes('khoác') || name.includes('chống nắng') || name.includes('quần') || name.includes('váy') || name.includes('đầm') || name.includes('giày') || name.includes('dép') || name.includes('túi') || name.includes('balo') || name.includes('blazer') || name.includes('croptop') || name.includes('sơ mi') || name.includes('thun') || name.includes('hoodie') || name.includes('jacket') || cat.includes('thời trang') || cat.includes('áo') || cat.includes('quần') || cat.includes('váy') || cat.includes('giày')) {
    return 'clothing';
  }

  // 3. Home & Kitchen & Household Items (Thermos, Lunchbox, Pillow, Towels, Decor, Lighting)
  if (name.includes('bình giữ nhiệt') || name.includes('hộp cơm') || name.includes('nồi chiên') || name.includes('lau nhà') || name.includes('khăn') || name.includes('gối') || name.includes('bếp') || name.includes('gia dụng') || name.includes('đèn') || name.includes('nội thất') || name.includes('decor') || cat.includes('gia dụng') || cat.includes('nhà bếp') || cat.includes('đồ dùng nhà')) {
    return 'home';
  }

  // 4. Baby & Mother Items
  if (name.includes('bỉm') || name.includes('tã') || name.includes('sữa công thức') || name.includes('xe tập đi') || name.includes('sơ sinh') || name.includes('núm ti') || name.includes('bình sữa')) {
    return 'baby';
  }

  // 5. Tech / Electronics / Gadgets (Headset, Phone stand, Keyboard, Charger, Massage)
  if (name.includes('điện thoại') || name.includes('laptop') || name.includes('tai nghe') || name.includes('bàn phím') || name.includes('chuột') || name.includes('sạc') || name.includes('cáp') || name.includes('ốp') || name.includes('kính cường lực') || name.includes('máy tính') || name.includes('loa') || name.includes('massage') || name.includes('kệ để điện thoại') || cat.includes('điện tử') || cat.includes('phụ kiện')) {
    return 'tech';
  }

  // 6. Books & Stationery & Stickers
  if (name.includes('sách') || name.includes('sổ') || name.includes('bút') || name.includes('sticker') || name.includes('văn phòng phẩm') || name.includes('journal') || cat.includes('văn phòng phẩm')) {
    return 'book';
  }

  // 7. Sports & Outdoor
  if (name.includes('lều') || name.includes('thảm yoga') || name.includes('chạy bộ') || name.includes('cắm trại') || name.includes('dã ngoại')) {
    return 'sport';
  }

  // 8. Food & Organic Nuts & Tea Drink (Only if "trà" is actual tea drink, e.g. "Trà thảo mộc", "Trà gạo lứt")
  if (name.includes('thực phẩm') || name.includes('trái cây') || name.includes('hạt') || name.includes('ngũ cốc') || name.includes('granola') || name.includes('trà thảo mộc') || name.includes('trà gạo lứt') || name.includes('yến mạch')) {
    return 'food';
  }

  // Fallbacks using fullText if name alone didn't match
  if (fullText.includes('nước hoa') || fullText.includes('skincare') || fullText.includes('son') || fullText.includes('mỹ phẩm') || fullText.includes('beauty')) return 'beauty';
  if (fullText.includes('bình giữ nhiệt') || fullText.includes('gia dụng') || fullText.includes('home') || fullText.includes('kitchen')) return 'home';
  if (fullText.includes('bỉm') || fullText.includes('tã') || fullText.includes('sữa')) return 'baby';
  if (fullText.includes('phone') || fullText.includes('laptop') || fullText.includes('tai nghe') || fullText.includes('bàn phím') || fullText.includes('tech') || fullText.includes('audio')) return 'tech';
  if (fullText.includes('sách') || fullText.includes('book')) return 'book';
  if (fullText.includes('sport') || fullText.includes('thể thao')) return 'sport';
  if (fullText.includes('thực phẩm') || fullText.includes('hạt') || fullText.includes('food')) return 'food';
  if (fullText.includes('áo') || fullText.includes('quần') || fullText.includes('váy') || fullText.includes('giày') || fullText.includes('thời trang') || fullText.includes('fashion')) return 'clothing';

  return 'general';
}

export function getExactItemData(product) {
  const name = (product.name || '').toLowerCase();
  const cat = (product.categoryName || '').toLowerCase();

  // 1. Hộp cơm giữ nhiệt / cà mên / bento
  if (name.includes('hộp cơm') || name.includes('cà mên') || name.includes('bento')) {
    return {
      variants: ['Phân loại: Dung tích 2 tầng - Inox 304', 'Phân loại: Bộ 3 Tầng Kèm Muỗng Nĩa', 'Phân loại: Màu Xanh Mint 2 Tầng', 'Phân loại: Màu Hồng Pastel 2 Tầng'],
      templates: {
        POS: [
          { text: 'Hộp cơm 2 tầng giữ nóng cơm canh trưa ăn vẫn bốc khói! Khay inox 304 tháo rời dễ rửa không bám mỡ.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu Inox 304', sentiment: 'POS' }, { aspect: 'Performance_Functionality', label: 'Khả năng giữ nóng', sentiment: 'POS' }] },
          { text: 'Nắp gài 4 góc khóa siêu chắc chắn, tầng đựng canh có ron cao su chống tràn tuyệt đối không rỉ ra túi mang cơm.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Nắp gài chống tràn', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Thiết kế tiện lợi', sentiment: 'POS' }] },
          { text: 'Thiết kế 2 tầng chia ngăn tiện lợi không lo trộn lẫn thức ăn. Tặng kèm bộ muỗng nĩa xịn xò!', aspects: [{ aspect: 'Appearance_Design', label: 'Thiết kế 2 tầng', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Quà tặng kèm', sentiment: 'POS' }] },
          { text: 'Mang cơm đi làm văn phòng quá chuẩn. Giữ ấm tầm 4-5 tiếng, chất liệu inox an toàn vệ sinh.', aspects: [{ aspect: 'Usability_Experience', label: 'Dùng văn phòng', sentiment: 'POS' }, { aspect: 'Material_BuildQuality', label: 'Chất liệu Inox 304', sentiment: 'POS' }] },
          { text: 'Shop đóng gói thùng bọc chống sốc siêu cẩn thận. Hộp cơm đẹp sang trọng hơn mong đợi!', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói hàng', sentiment: 'POS' }, { aspect: 'Appearance_Design', label: 'Thiết kế đẹp', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Hộp cơm giữ nhiệt ở mức vừa phải, mang từ 7h sáng tới 12h trưa cơm còn ấm nhẹ.', aspects: [{ aspect: 'Performance_Functionality', label: 'Thời gian giữ ấm', sentiment: 'NEU' }] },
          { text: 'Dung tích khay hơi nhỏ với bạn nam ăn nhiều, các bạn nữ hoặc dân văn phòng thì vừa vặn.', aspects: [{ aspect: 'Usability_Experience', label: 'Dung tích khay', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Khay nắp gài tầng dưới hơi xộc xệch, để canh nghiêng bị rỉ nước ra túi mang cơm!', aspects: [{ aspect: 'Product_Defect', label: 'Nắp gài bị rò nước', sentiment: 'NEG' }, { aspect: 'Performance_Functionality', label: 'Khả năng đậy kín kém', sentiment: 'NEG' }] },
          { text: 'Quai xách hộp cơm bị gãy ngàm nhựa khi mới dùng đợt thứ 2. Nhắn hỗ trợ shop trả lời rất chậm.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất lượng quai nhựa', sentiment: 'NEG' }, { aspect: 'Response_Time', label: 'Phản hồi CSKH', sentiment: 'NEG' }] },
          { text: 'Giữ nhiệt kém, để được tầm 2 tiếng là cơm canh nguội ngắt. Thất vọng so với mô tả.', aspects: [{ aspect: 'Performance_Functionality', label: 'Giữ nhiệt kém', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 2. Bình giữ nhiệt (chỉ bình đựng nước)
  if (name.includes('bình giữ nhiệt') || name.includes('bình nước')) {
    return {
      variants: ['Phân loại: Dung tích 600ml - Inox 304 Bạc', 'Phân loại: Dung tích 600ml - Đen Nhám', 'Phân loại: Dung tích 600ml - Xanh Rêu', 'Phân loại: Combo Bình + Dây Treo'],
      templates: {
        POS: [
          { text: 'Bình giữ nhiệt 600ml giữ đá lạnh từ sáng 7h tới 6h chiều vẫn còn nguyên cục đá! Inox 304 không ám mùi kim loại.', aspects: [{ aspect: 'Performance_Functionality', label: 'Khả năng giữ đá', sentiment: 'POS' }, { aspect: 'Material_BuildQuality', label: 'Inox 304 cao cấp', sentiment: 'POS' }] },
          { text: 'Nắp bật tiện lợi có khóa gài chống tràn tuyệt đối, để nằm ngang trong balo không rỉ một giọt nước.', aspects: [{ aspect: 'Usability_Experience', label: 'Nắp bật chống tràn', sentiment: 'POS' }] },
          { text: 'Thiết kế bình sơn nhám sang trọng cầm đầm tay. Có quai xách silicone đi tập gym hay đi học rất tiện.', aspects: [{ aspect: 'Appearance_Design', label: 'Sơn nhám đầm tay', sentiment: 'POS' }] },
          { text: 'Khả năng giữ nóng xuất sắc, pha trà hay cà phê từ sáng đến trưa vẫn bốc khói ấm áp.', aspects: [{ aspect: 'Performance_Functionality', label: 'Giữ nóng xuất sắc', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Bình giữ nhiệt dùng khá ổn, tầm 6-8 tiếng nước ấm nguội dần. Sơn nắp nhựa hơi bám vân tay nhẹ.', aspects: [{ aspect: 'Performance_Functionality', label: 'Thời gian giữ nhiệt', sentiment: 'NEU' }] },
          { text: 'Dung tích 600ml vừa vặn dùng cá nhân, cầm đi làm đi học gọn nhẹ.', aspects: [{ aspect: 'Usability_Experience', label: 'Dung tích cá nhân', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Bình bị rỉ nước ở ron silicone nắp bật khi để nằm ngang trong balo. Giữ đá chỉ được 3 tiếng là tan hết.', aspects: [{ aspect: 'Product_Defect', label: 'Lỗi rò nước nắp', sentiment: 'NEG' }, { aspect: 'Performance_Functionality', label: 'Giữ nhiệt kém', sentiment: 'NEG' }] },
          { text: 'Vỏ bình bị móp gầm đáy khi nhận hàng do shipper quăng quật, sơn đáy bị tróc.', aspects: [{ aspect: 'External_Packaging', label: 'Vận chuyển méo móp', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 3. Đèn ngủ / Đèn cảm biến
  if (name.includes('đèn ngủ') || name.includes('đèn cảm biến') || name.includes('đèn led') || name.includes('đèn decor') || name.includes('chiếu sáng')) {
    return {
      variants: ['Phân loại: Ánh Sáng Vàng Ấm - Cắm Điện Direct', 'Phân loại: Ánh Sáng Trắng - Cảm Ứng Chuyển Động', 'Phân loại: Combo 2 Đèn Cảm Biến'],
      templates: {
        POS: [
          { text: 'Đèn ngủ cảm biến ánh sáng tự động bật khi trời tối và tắt khi trời sáng, công suất tiết kiệm điện tuyệt vời!', aspects: [{ aspect: 'Performance_Functionality', label: 'Cảm biến tự động', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Tiết kiệm điện', sentiment: 'POS' }] },
          { text: 'Ánh sáng vàng dịu mắt không gây chói cho em bé và người già khi dậy đi vệ sinh ban đêm.', aspects: [{ aspect: 'Usability_Experience', label: 'Ánh sáng dịu mắt', sentiment: 'POS' }] },
          { text: 'Thiết kế nhỏ gọn cắm trực tiếp ổ điện gọn gàng, cảm biến nhận diện ánh sáng siêu nhạy.', aspects: [{ aspect: 'Appearance_Design', label: 'Nhỏ gọn cắm điện', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Đèn cảm biến ánh sáng hoạt động ổn định. Bán kính cảm biến nhận diện tốt trong tầm 2-3 mét.', aspects: [{ aspect: 'Performance_Functionality', label: 'Bán kính cảm biến', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Cảm biến nhạy quá mức, ban ngày phòng hơi u uất chút đã tự bật sáng hao điện.', aspects: [{ aspect: 'Product_Defect', label: 'Cảm biến quá nhạy', sentiment: 'NEG' }] },
          { text: 'Mới cắm được 3 ngày thì bóng đèn bị chập chớp tắt liên tục rồi hỏng luôn.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Lỗi bóng chập hỏng', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 4. Khăn lau / Set khăn
  if (name.includes('khăn') || name.includes('khăn lau')) {
    return {
      variants: ['Phân loại: Set 5 Khăn Cotton Thấm Nước', 'Phân loại: Set 10 Khăn Đa Năng Treo Bếp', 'Phân loại: Màu Nhã Nhặn Mix'],
      templates: {
        POS: [
          { text: 'Khăn lau tay chất liệu cotton siêu mềm mịn thấm nước cực tốt, lau xong khô ráo không rụng bông!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Cotton mềm thấm nước', sentiment: 'POS' }] },
          { text: 'Set 5 khăn màu sắc nhã nhặn xinh xắn có dây treo tiện lợi treo ở bếp và nhà tắm.', aspects: [{ aspect: 'Appearance_Design', label: 'Màu nhã nhặn có dây treo', sentiment: 'POS' }] },
          { text: 'Khăn giặt không bị xù lông hay phai màu, lau bàn ăn hay chén đĩa sạch bóng.', aspects: [{ aspect: 'Usability_Experience', label: 'Lau siêu sạch', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Khăn hơi mỏng hơn hình một chút nhưng độ thấm hút nước dùng vẫn rất ổn.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Độ dày khăn', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Khăn giặt lần đầu bị rụng bông sợi mịn dính đầy tay. Chất vải hóa học hơi hôi.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Rụng bông xù sợi', sentiment: 'NEG' }] },
          { text: 'Giao thiếu 1 khăn trong set 5 khăn. Đã nhắn phản hồi cho shop.', aspects: [{ aspect: 'Fulfillment_Accuracy', label: 'Giao thiếu số lượng', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 5. Túi tote / Canvas
  if (name.includes('túi tote') || name.includes('túi canvas') || name.includes('túi xách')) {
    return {
      variants: ['Phân loại: Vải Canvas Trắng - Kèm Khóa Kéo', 'Phân loại: Vải Canvas Đen - Họa Tiết', 'Phân loại: Size L Đựng Laptop 14 inch'],
      templates: {
        POS: [
          { text: 'Túi tote vải canvas dày dặn may đường chỉ chắc chắn, đựng vừa laptop 14 inch và sách vở A4!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Canvas dày dặn', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Đựng vừa laptop', sentiment: 'POS' }] },
          { text: 'Form túi đứng đẹp có quai xách đai vai đầm dặn. Bên trong có ngăn nhỏ kéo khóa tiện dùng.', aspects: [{ aspect: 'Appearance_Design', label: 'Form túi & Quai đầm', sentiment: 'POS' }] },
          { text: 'Họa tiết in sắc nét không lem khi giặt. Phong cách Hàn Quốc trẻ trung xinh xắn.', aspects: [{ aspect: 'Appearance_Design', label: 'In sắc nét phong cách', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Vải canvas hơi mỏng nhẹ, túi không có mút lót đáy nên để đồ quá nặng hơi trũng.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Không lót mút đáy', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Quai túi bị tuột chỉ bung mép khi đựng 2 cuốn sách nặng. Đường may gia công sơ sài.', aspects: [{ aspect: 'Product_Defect', label: 'Tuột chỉ quai túi', sentiment: 'NEG' }] },
          { text: 'Túi bị dính vệt bẩn đen khi nhận hàng, khâu kéo khóa bị kẹt không trôi.', aspects: [{ aspect: 'External_Packaging', label: 'Túi dính bẩn', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 6. Máy massage
  if (name.includes('massage') || name.includes('mát xa')) {
    return {
      variants: ['Phân loại: Máy 4 Đầu Massage - Màu Đen', 'Phân loại: Máy Mini Cầm Tay - Màu Hồng', 'Phân loại: Sạc Type-C 6 Nấc Rung'],
      templates: {
        POS: [
          { text: 'Máy massage 4 đầu thay thế đấm bóp êm dịu bớt mỏi cổ vai rung đầm tay cực thích!', aspects: [{ aspect: 'Performance_Functionality', label: 'Rung đầm bớt mỏi', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: '4 đầu thay thế', sentiment: 'POS' }] },
          { text: 'Pin máy dùng trâu sạc Type-C tiện lợi. 6 nấc độ rung điều chỉnh từ nhẹ tới mạnh vừa ý.', aspects: [{ aspect: 'Performance_Functionality', label: 'Pin trâu & 6 nấc rung', sentiment: 'POS' }] },
          { text: 'Thiết kế nhỏ gọn vừa tay cầm đi du lịch hay làm việc văn phòng đều dùng được.', aspects: [{ aspect: 'Appearance_Design', label: 'Nhỏ gọn cầm tay', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Máy rung khá mạnh ở nấc 1, dùng hơi tê tay nhẹ nếu cầm lâu liên tục 20 phút.', aspects: [{ aspect: 'Usability_Experience', label: 'Lực rung mạnh', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Máy chạy được 5 phút thì nóng ran động cơ và tự tắt nguồn không bật lên lại được.', aspects: [{ aspect: 'Product_Defect', label: 'Động cơ nóng tự tắt', sentiment: 'NEG' }] },
          { text: 'Đầu massage bằng nhựa cứng đấm vào cơ bị đau rát chứ không êm như quảng cáo.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Đầu nhựa cứng đau', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 7. Sticker / Journal
  if (name.includes('sticker') || name.includes('dán sổ') || name.includes('journal')) {
    return {
      variants: ['Phân loại: Bộ 100 Tấm Translucent', 'Phân loại: Set Sticker Vintage Journal', 'Phân loại: Hộp Nhựa Trong'],
      templates: {
        POS: [
          { text: 'Bộ sticker họa tiết vô cùng đáng yêu in sắc nét chuẩn màu, keo dán dính chắc chống nước tốt!', aspects: [{ aspect: 'Appearance_Design', label: 'In sắc nét dễ thương', sentiment: 'POS' }, { aspect: 'Material_BuildQuality', label: 'Keo dính tốt', sentiment: 'POS' }] },
          { text: 'Nhiều hình đa dạng tha hồ trang trí sổ tay journal hay dán nón bảo hiểm, laptop.', aspects: [{ aspect: 'Usability_Experience', label: 'Hình đa dạng dán sổ', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Sticker hơi khó bóc lớp đế nilon phía sau một chút đối với hình mỏng nhỏ.', aspects: [{ aspect: 'Usability_Experience', label: 'Thao tác bóc đế', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Keo sticker dán rất yếu vừa dán lên sổ 5 phút đã bị bung góc. Mực in bị lem nhòe.', aspects: [{ aspect: 'Product_Defect', label: 'Keo yếu bung góc', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 8. Kệ điện thoại / Giá đỡ
  if (name.includes('kệ để điện thoại') || name.includes('giá đỡ') || name.includes('kệ điện thoại')) {
    return {
      variants: ['Phân loại: Nhôm Nguyên Khối - Gấp Gọn', 'Phân loại: Hợp Kim Xoay 360 Độ', 'Phân loại: Màu Bạc Ánh Kim'],
      templates: {
        POS: [
          { text: 'Kệ điện thoại bằng hợp kim nhôm nặng đầm bám chắc bàn chống trượt silicone cực tốt!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Hợp kim nhôm đầm', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Bám chắc chống trượt', sentiment: 'POS' }] },
          { text: 'Khớp xoay gập đa góc độ chắc chắn không bị xệ khi để iPad hay điện thoại nặng.', aspects: [{ aspect: 'Performance_Functionality', label: 'Khớp xoay chắc chắn', sentiment: 'POS' }] },
          { text: 'Gấp gọn phẳng đét bỏ túi xách đi làm đi cà phê cực kỳ tiện lợi.', aspects: [{ aspect: 'Appearance_Design', label: 'Gấp gọn tiện lợi', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Kệ hợp kim nhôm nhưng chân hơi nhẹ nếu để máy tính bảng 11 inch theo chiều dọc.', aspects: [{ aspect: 'Usability_Experience', label: 'Độ cân bằng iPad', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Lớp đệm silicone lót đáy bị bung keo rơi mất. Khớp xoay lỏng lẻo để điện thoại vào là sập.', aspects: [{ aspect: 'Product_Defect', label: 'Bung đệm silicone', sentiment: 'NEG' }, { aspect: 'Material_BuildQuality', label: 'Khớp xoay lỏng lẻo', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 9. Nước hoa sáp / Sáp thơm
  if (name.includes('nước hoa sáp') || name.includes('sáp thơm') || name.includes('nước hoa')) {
    return {
      variants: ['Phân loại: Hương Trà Trắng - 15g', 'Phân loại: Hương Hoa Nhài Dịu Nhẹ', 'Phân loại: Hũ Vỏ Kim Loại Vàng Gold'],
      templates: {
        POS: [
          { text: 'Nước hoa sáp hương trà trắng thanh mát dịu nhẹ sang chảnh, thoa lên cổ tay lưu hương 6-8 tiếng!', aspects: [{ aspect: 'Performance_Functionality', label: 'Mùi hương & Lưu hương', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Thoa dịu nhẹ', sentiment: 'POS' }] },
          { text: 'Hũ sáp vỏ kim loại nhỏ xinh tiện bỏ túi áo túi xách mang đi làm đi chơi.', aspects: [{ aspect: 'Appearance_Design', label: 'Hũ kim loại nhỏ xinh', sentiment: 'POS' }] },
          { text: 'Mùi thơm không bị nồng gắt hóa chất, dịu ngọt thư thái như spa cao cấp.', aspects: [{ aspect: 'Performance_Functionality', label: 'Mùi thư thái không nồng', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Mùi hương tỏa nhẹ trong bán kính 1 cánh tay, hợp dùng mùa hè khô thoáng.', aspects: [{ aspect: 'Performance_Functionality', label: 'Độ tỏa hương', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Nước hoa sáp hầu như không có mùi thơm gì, thoa lên 15 phút đã bay sạch mùi. Hũ sáp bị trầy xước.', aspects: [{ aspect: 'Product_Defect', label: 'Bay mùi nhanh', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 10. Gối cổ / Memory foam
  if (name.includes('gối cổ') || name.includes('memory foam') || name.includes('cao su non')) {
    return {
      variants: ['Phân loại: Memory Foam Nhung - Xám', 'Phân loại: Gối Cổ Cao Su Non - Xanh', 'Phân loại: Vỏ Nhung Có Khóa Kéo'],
      templates: {
        POS: [
          { text: 'Gối cổ memory foam ruột cao su non đàn hồi chậm siêu êm nâng đỡ đốt sống cổ tuyệt vời!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Memory foam đàn hồi', sentiment: 'POS' }, { aspect: 'Usability_Experience', label: 'Nâng đỡ đốt sống cổ', sentiment: 'POS' }] },
          { text: 'Vải bọc gối nhung mềm mịn thoáng khí có khóa kéo tháo ra giặt dễ dàng.', aspects: [{ aspect: 'Usability_Experience', label: 'Vỏ nhung dễ tháo giặt', sentiment: 'POS' }] },
          { text: 'Đi xe khách hay máy bay có gối này ngủ không bao giờ bị nghẹo cổ mỏi vai.', aspects: [{ aspect: 'Performance_Functionality', label: 'Chống mỏi nghẹo cổ', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Gối mới bóc hộp có mùi cao su nhẹ, để quạt thoáng 1 ngày là hết mùi.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Mùi cao su mới', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Ruột gối bị lún méo móp không phục hồi lại hình dáng ban đầu. Vải bọc bị bục chỉ.', aspects: [{ aspect: 'Product_Defect', label: 'Ruột lún không hồi', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 11. Áo khoác chống nắng
  if (name.includes('áo khoác chống nắng') || name.includes('áo chống nắng')) {
    return {
      variants: ['Màu Sắc: Ghi Xám - Size L', 'Màu Sắc: Xanh Mint - Size M', 'Màu Sắc: Hồng Baby - Size S', 'Màu Sắc: Kem Sữa - Size XL'],
      templates: {
        POS: [
          { text: 'Áo khoác chống nắng vải thun lạnh cản UV tốt, mặt vải thoáng mát có xỏ ngón và mũ trùm đầu che kín mặt!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Thun lạnh cản UV', sentiment: 'POS' }, { aspect: 'Performance_Functionality', label: 'Mũ trùm & Xỏ ngón', sentiment: 'POS' }] },
          { text: 'Chất vải dày dặn chống nắng tốt, mặc đi giữa trưa nắng không bị rát da. Có túi khóa kéo bên trong để điện thoại.', aspects: [{ aspect: 'Usability_Experience', label: 'Chống rát nắng tốt', sentiment: 'POS' }] },
          { text: 'Áo form rộng thoải mái, đường may viền tỉ mỉ. Thích nhất là cái khẩu trang kéo cao tích hợp sẵn!', aspects: [{ aspect: 'Appearance_Design', label: 'Khẩu trang tích hợp', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Áo chống nắng tạm ổn, hơi nóng nhẹ khi đi giữa trời trưa hè 39-40 độ.', aspects: [{ aspect: 'Performance_Functionality', label: 'Độ thoáng khí', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Khóa kéo bị rít giật mạnh nấc kẹp vải. Mới giặt 1 nước đã bị xù lông nhẹ ở tay áo.', aspects: [{ aspect: 'Product_Defect', label: 'Khóa kéo rít & Xù lông', sentiment: 'NEG' }] },
          { text: 'Áo giao sai màu, đặt màu ghi xám mà shop giao màu hồng. Nhắn CSKH đổi hàng lâu rep.', aspects: [{ aspect: 'Fulfillment_Accuracy', label: 'Giao sai màu', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 12. Bỉm / Tã / Sữa
  if (name.includes('bỉm') || name.includes('tã') || name.includes('sữa')) {
    return {
      variants: ['Phân loại: Bịch XL 54 miếng', 'Phân loại: Lon 800g (1-3 tuổi)', 'Phân loại: Combo 2 Bịch Tiết Kiệm'],
      templates: {
        POS: [
          { text: 'Bỉm mỏng nhẹ thấm hút siêu tốt, mông bé khô thoáng cả đêm không bị hăm hay mẩn đỏ.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Bông dịu nhẹ', sentiment: 'POS' }, { aspect: 'Performance_Functionality', label: 'Thấm hút chống hăm', sentiment: 'POS' }] },
          { text: 'Sữa thơm ngậy mát lành bé rất thích uống, date xa tận 2028. Shop đóng bọc xốp chống sốc chắc chắn!', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Hàng date xa', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Form bỉm hơi nhỏ so với cân nặng bao bì, bé đùi to nên nhích lên 1 size.', aspects: [{ aspect: 'Usability_Experience', label: 'Kích cỡ size bỉm', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Bỉm bị vón cục sau khi thấm nước, bé đeo vào bị mẩn đỏ ngứa da đùi. Rất lo lắng!', aspects: [{ aspect: 'Product_Defect', label: 'Vón cục thấm kém', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 13. Tai nghe / Headset
  if (name.includes('tai nghe') || name.includes('tws') || name.includes('headphone')) {
    return {
      variants: ['Phân loại: Bluetooth 5.3 - Đen Nhám', 'Phân loại: ANC Chống Ồn - Trắng Tinh Khôi', 'Phân loại: Bản Gaming Pin 40h'],
      templates: {
        POS: [
          { text: 'Tai nghe âm bass đầm chắc không bị rè ở âm lượng lớn, tính năng chống ồn ANC hoạt động hiệu quả bất ngờ!', aspects: [{ aspect: 'Sound_Quality', label: 'Âm bass chắc & ANC', sentiment: 'POS' }] },
          { text: 'Mic thu âm đàm thoại trong vắt không bị rè hay lẫn tạp âm gió khi đi ngoài đường. Pin dùng liên tục 3 ngày!', aspects: [{ aspect: 'Performance_Functionality', label: 'Mic đàm thoại & Pin trâu', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Dùng ổn trong tầm giá này. Kết nối đôi lúc chập chờn nhẹ khi cách xa trên 8 mét.', aspects: [{ aspect: 'Performance_Functionality', label: 'Khả năng kết nối', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Dùng được 2 tuần thì tai bên phải bị mất tiếng chập chờn. Liên hệ bảo hành quy trình lâu.', aspects: [{ aspect: 'Product_Defect', label: 'Lỗi tai bên phải', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 14. Bàn phím / Chuột
  if (name.includes('bàn phím') || name.includes('chuột')) {
    return {
      variants: ['Phân loại: Switch Red - LED RGB', 'Phân loại: Switch Blue - Trắng', 'Phân loại: Bluetooth Không Dây'],
      templates: {
        POS: [
          { text: 'Bàn phím gõ siêu nẩy êm tay, led RGB đẹp chill. Kết nối Bluetooth mượt không độ trễ chơi game tốt!', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm gõ mượt', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Vỏ nhựa bám nhẹ vân tay, dùng ổn định văn phòng.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Gia công vỏ nhựa', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Bàn phím bị liệt hàng phím số sau 3 ngày sử dụng. Nhắn tin CSKH không reply.', aspects: [{ aspect: 'Product_Defect', label: 'Liệt phím', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 15. Nồi chiên / Robot / Máy lọc / Bếp / Ấm / Ép
  if (name.includes('nồi chiên') || name.includes('robot') || name.includes('máy lọc') || name.includes('ấm siêu tốc') || name.includes('máy ép')) {
    return {
      variants: ['Phân loại: Dung tích Lớn 6L - Điện Tử', 'Phân loại: Màu Trắng Ngọc Trai', 'Phân loại: Bản Cao Cấp 2026'],
      templates: {
        POS: [
          { text: 'Thiết bị hoạt động siêu êm ái, hoàn thiện tỉ mỉ sang trọng. Vệ sinh lau chùi cực kỳ dễ dàng!', aspects: [{ aspect: 'Usability_Experience', label: 'Dễ dàng vệ sinh', sentiment: 'POS' }, { aspect: 'Appearance_Design', label: 'Thiết kế sang trọng', sentiment: 'POS' }] },
          { text: 'Công suất mạnh mẽ chiên nướng / lọc bụi / hút bụi cực kỳ sạch sẽ. Đáng tiền cực kỳ luôn nha!', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu suất cao', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Máy chạy tiếng kêu vừa phải ở nấc tối đa, chất lượng dùng ổn định.', aspects: [{ aspect: 'Performance_Functionality', label: 'Độ ồn máy', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Máy mới dùng 2 đợt thì bị khét chập điện tự tắt nguồn. Liên hệ bảo hành quá chậm.', aspects: [{ aspect: 'Product_Defect', label: 'Chập điện nóng máy', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 16. Hạt / Ngũ cốc / Trà / Thực phẩm
  if (name.includes('hạt') || name.includes('ngũ cốc') || name.includes('granola') || name.includes('trà') || name.includes('yến mạch')) {
    return {
      variants: ['Phân loại: Hũ 500g Sấy Mộc', 'Phân loại: Túi Zip 1kg Ngũ Cốc', 'Phân loại: Hộp Trà 200g'],
      templates: {
        POS: [
          { text: 'Sản phẩm giòn rụm thơm béo không bị hôi dầu. Đóng hũ nhựa PET seal kim loại chống ẩm tốt!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Độ giòn thơm', sentiment: 'POS' }, { aspect: 'External_Packaging', label: 'Hũ seal chống ẩm', sentiment: 'POS' }] },
          { text: 'Trà / Hạt thơm mát thanh lọc cơ thể giúp thư giãn ngủ ngon. Giao hàng hỏa tốc quá ưng!', aspects: [{ aspect: 'Performance_Functionality', label: 'Hương vị & Tác dụng', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Thực phẩm ngon nhưng cần bảo quản kỹ chống ẻo sau khi mở seal.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Bảo quản chống ẩm', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Hạt bị hôi dầu đắng mốc không thể ăn được. Đề nghị shop đổi trả hũ mới!', aspects: [{ aspect: 'Product_Defect', label: 'Hôi dầu hỏng mốc', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 17. Quần / Áo / Váy / Giày (General apparel)
  if (name.includes('áo') || name.includes('quần') || name.includes('váy') || name.includes('đầm') || name.includes('giày') || name.includes('dép') || cat.includes('thời trang') || cat.includes('giày')) {
    return {
      variants: ['Phân loại: Size M - Màu Đen', 'Phân loại: Size L - Màu Trắng', 'Phân loại: Size XL - Màu Xanh'],
      templates: {
        POS: [
          { text: 'Chất vải / chất liệu mềm mát, đường may chắc chắn tỉ mỉ không có chỉ thừa. Form dáng tôn suông che khuyết điểm rất tốt!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu cao cấp', sentiment: 'POS' }, { aspect: 'Appearance_Design', label: 'Form dáng thiết kế', sentiment: 'POS' }] },
          { text: 'Mang lên siêu êm thoải mái không bị đau gót hay cọ xát. Đóng gói túi zip chỉn chu.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm êm ái', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Chất liệu mỏng hơn hình quảng cáo một chút, mặc mùa hè thì thoáng mát.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Độ mỏng mát', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Giao sai phân loại màu rồi shop ơi! Đặt màu đen mà giao màu xám. Đề nghị shop đổi sản phẩm mới.', aspects: [{ aspect: 'Fulfillment_Accuracy', label: 'Giao sai phân loại', sentiment: 'NEG' }] },
          { text: 'Vải mỏng xù lông giặt 1 nước đã nhăn bèo nhèo. Thất vọng so with giá tiền.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất lượng vải xù', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  // 18. Mỹ phẩm / Serum / Son / Skincare (General beauty)
  if (name.includes('skincare') || name.includes('son') || name.includes('serum') || name.includes('dưỡng') || cat.includes('mỹ phẩm') || cat.includes('làm đẹp')) {
    return {
      variants: ['Phân loại: Bản 50ml Phục Hồi', 'Phân loại: Tuýp 100g Kiềm Dầu', 'Phân loại: Hộp Dưỡng Ẩm'],
      templates: {
        POS: [
          { text: 'Dùng mượt da ẩm mịn thấy rõ, không bị kích ứng mẩn đỏ. Chất serum/kem thấm cực nhanh!', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu quả dưỡng da', sentiment: 'POS' }] },
          { text: 'Hàng chính hãng tem mác tiếng Việt chống giả đầy đủ. Đóng gói bọc xốp kỹ lưỡng.', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Chính hãng tem mác', sentiment: 'POS' }] },
        ],
        NEU: [
          { text: 'Chất kem hơi đặc nên cần tán nhanh tay, kiềm dầu được 4 tiếng. Giá hợp lý.', aspects: [{ aspect: 'Usability_Experience', label: 'Chất kem & Độ kiềm dầu', sentiment: 'NEU' }] },
        ],
        NEG: [
          { text: 'Da bôi vào bị châm chích mẩn đỏ. Vòi pump xịt bị nghẽn ấn không ra sản phẩm.', aspects: [{ aspect: 'Product_Defect', label: 'Dị ứng & Vòi nghẽn', sentiment: 'NEG' }] },
        ]
      }
    };
  }

  return null;
}

const DOMAIN_TEMPLATES = {
  home: {
    POS: [
      { text: 'Sản phẩm gia dụng thiết kế tối giản đẹp mắt, hoàn thiện tỉ mỉ sang trọng. Đóng gói bọc xốp cẩn thận.', aspects: [{ aspect: 'Appearance_Design', label: 'Thiết kế đẹp', sentiment: 'POS' }, { aspect: 'External_Packaging', label: 'Đóng gói bọc xốp', sentiment: 'POS' }] },
      { text: 'Gia dụng hoạt động siêu êm ái, vệ sinh chùi rửa rất dễ dàng. Đáng tiền cực kỳ luôn!', aspects: [{ aspect: 'Usability_Experience', label: 'Dễ vệ sinh', sentiment: 'POS' }, { aspect: 'Price_Performance_Ratio', label: 'Đáng tiền', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Sản phẩm dùng khá ổn trong tầm giá, hoàn thiện trung bình.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng vừa đủ', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Đóng gói sơ sài làm vỏ móp méo. Nhắn phản hồi CSKH thì trả lời chậm.', aspects: [{ aspect: 'External_Packaging', label: 'Móp vỏ hộp', sentiment: 'NEG' }] },
    ]
  },
  baby: {
    POS: [
      { text: 'Sản phẩm mẹ và bé chất liệu an toàn mềm mại, date xa. Đóng gói chắc chắn!', aspects: [{ aspect: 'Material_BuildQuality', label: 'An toàn da bé', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Kích thước hơi nhỏ một chút so với hình mô tả.', aspects: [{ aspect: 'Usability_Experience', label: 'Kích cỡ', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Vỏ hộp bị dằn xóc móp nắp khi nhận hàng.', aspects: [{ aspect: 'External_Packaging', label: 'Giao hàng méo móp', sentiment: 'NEG' }] },
    ]
  },
  tech: {
    POS: [
      { text: 'Hàng nguyên seal mới 100%, kết nối nhanh mượt không độ trễ!', aspects: [{ aspect: 'Authenticity_Packaging', label: 'Chính hãng nguyên seal', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Dùng ổn định trong tầm giá này.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng vừa đủ', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Mới dùng được vài ngày thì bị lỗi chập chờn.', aspects: [{ aspect: 'Product_Defect', label: 'Lỗi thiết bị', sentiment: 'NEG' }] },
    ]
  },
  clothing: {
    POS: [
      { text: 'Chất vải mướt mát, đường may chắc chắn tỉ mỉ. Form chuẩn đẹp!', aspects: [{ aspect: 'Material_BuildQuality', label: 'Chất liệu vải', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Chất vải mỏng mát hợp mặc mùa hè.', aspects: [{ aspect: 'Material_BuildQuality', label: 'Độ dày vải', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Giao sai màu sắc phân loại.', aspects: [{ aspect: 'Fulfillment_Accuracy', label: 'Giao sai hàng', sentiment: 'NEG' }] },
    ]
  },
  beauty: {
    POS: [
      { text: 'Mỹ phẩm thơm nhẹ mượt da, hàng chính hãng tem mác đầy đủ.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu quả sử dụng', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Dùng vừa phải kiềm dầu 3-4 tiếng.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Da bôi vào bị châm chích mẩn đỏ nhẹ.', aspects: [{ aspect: 'Product_Defect', label: 'Kích ứng', sentiment: 'NEG' }] },
    ]
  },
  general: {
    POS: [
      { text: 'Sản phẩm dùng rất ổn định, hoàn thiện cao cấp đúng mô tả.', aspects: [{ aspect: 'Usability_Experience', label: 'Trải nghiệm tốt', sentiment: 'POS' }] },
    ],
    NEU: [
      { text: 'Hàng tạm ổn trong tầm giá.', aspects: [{ aspect: 'Performance_Functionality', label: 'Hiệu năng', sentiment: 'NEU' }] },
    ],
    NEG: [
      { text: 'Đóng gói móp méo.', aspects: [{ aspect: 'External_Packaging', label: 'Đóng gói kém', sentiment: 'NEG' }] },
    ]
  }
};

const DOMAIN_VARIANTS = {
  home: ['Phân loại: Bản Tiêu Chuẩn', 'Phân loại: Bản Cao Cấp', 'Phân loại: Màu Bạc Ánh Kim'],
  baby: ['Phân loại: Size Tiêu Chuẩn', 'Phân loại: Combo Tiết Kiệm'],
  tech: ['Phân loại: Bản Tiêu Chuẩn', 'Phân loại: Phiên Bản Pro'],
  clothing: ['Màu Sắc: Đen, Size: M', 'Màu Sắc: Trắng, Size: L'],
  beauty: ['Phân loại: Bản 50ml', 'Phân loại: Phiên Bản Mới'],
  general: ['Phân loại: Mặc định', 'Phân loại: Combo']
};

const COMMENT_PREFIXES = [
  "",
  "Giao hàng siêu nhanh! ",
  "Đã nhận được hàng nhé shop! ",
  "Sản phẩm rất tuyệt vời, ",
  "Ấn tượng đầu tiên là ",
  "Sau vài ngày sử dụng thì thấy ",
  "Mua đợt săn sale giá hời, ",
  "Shop đóng gói cẩn thận 3 lớp, ",
  "Mới bóc hộp ra thử liền, ",
  "Thật sự rất hài lòng luôn nha, ",
  "Chuẩn chính hãng 100%, ",
  "Đã ủng hộ shop lần thứ 2, ",
  "Cho shop 5 sao nè, ",
  "Chất lượng vượt xa mong đợi, "
];

// Product review comments generator (generates 50 realistic product-tailored comments per product)
export function generateMockComments(product, count = 50) {
  const exactData = getExactItemData(product);

  let templates;
  let variants;

  if (exactData) {
    templates = exactData.templates;
    variants = exactData.variants;
  } else {
    const domain = getProductDomain(product);
    templates = DOMAIN_TEMPLATES[domain] || DOMAIN_TEMPLATES.general;
    variants = DOMAIN_VARIANTS[domain] || DOMAIN_VARIANTS.general;
  }

  const comments = [];

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
    const pool = templates[sentiment] || templates.POS;
    const template = pool[i % pool.length];

    const starRating = sentiment === 'POS' ? ((i % 4 === 0) ? 4 : 5)
      : sentiment === 'NEU' ? 3
      : ((i % 3 === 0) ? 1 : 2);

    const dateOffsetHours = (count - i) * 6.5 + (i % 5);
    const commentDate = new Date(baseDate.getTime() - dateOffsetHours * 3600 * 1000);

    const userName = VIETNAMESE_NAMES[i % VIETNAMESE_NAMES.length];
    const variant = variants[i % variants.length];
    const prefix = COMMENT_PREFIXES[i % COMMENT_PREFIXES.length];

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
      content: prefix + template.text,
      aspects: template.aspects,
      helpfulVotes: (i * 7) % 29,
    });
  }

  return comments;
}

// Generate products for a specific category
export function getProductsForCategory(storeId, categoryId, options = {}) {
  const { includeComments = true } = options;
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
      if (includeComments) productObj.comments = generateMockComments(productObj, reviewCount);
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

    if (includeComments) productObj.comments = generateMockComments(productObj, reviewCount);
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
