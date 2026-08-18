-- ============================================================================
-- V2: Seed sample data for FeedbackAI platform testing
-- ============================================================================

-- 1. Demo User (email: demo@feedbackai.local, password: Demo@123)
INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
    1,
    'demo@feedbackai.local',
    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xD0m1bC.iW6H.8Oi',
    'Chủ Shop Demo',
    'OWNER',
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- 2. Demo Shop (Shopee)
INSERT INTO shops (id, user_id, platform, shop_name, access_token, refresh_token, token_expiry, connected_at, status)
VALUES (
    1,
    1,
    'shopee',
    'Gian hàng Công nghệ Official',
    'demo_access_token_shopee_12345',
    'demo_refresh_token_shopee_12345',
    now() + INTERVAL '30 days',
    now(),
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Products
INSERT INTO products (id, shop_id, external_id, name, category, image_url, created_at)
VALUES 
(1, 1, 'SP-001', 'Tai nghe Bluetooth Không Dây Pro ANC', 'Điện tử & Phụ kiện', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', now()),
(2, 1, 'SP-002', 'Pin Sạc Dự Phòng 20.000mAh Sạc Nhanh 22.5W', 'Phụ kiện Điện thoại', 'https://images.unsplash.com/photo-1609592424074-8848d7d6f5df', now()),
(3, 1, 'SP-003', 'Bàn Phím Cơ Không Dây RGB Hot-swap 75%', 'Thiết bị Máy tính', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', now())
ON CONFLICT (id) DO NOTHING;

-- 4. Demo Reviews
INSERT INTO reviews (id, product_id, external_id, author_name, content, rating, platform, reviewed_at, synced_at)
VALUES 
(1, 1, 'REV-101', 'Nguyễn Văn A', 'Tai nghe âm thanh cực hay, chống ồn tốt nhưng giao hàng chậm quá 3 ngày mới tới.', 4, 'shopee', now() - INTERVAL '2 days', now()),
(2, 1, 'REV-102', 'Trần Thị B', 'Pin trâu, kết nối nhanh mượt. Đóng gói rất cẩn thận bọc chống sốc dầy.', 5, 'shopee', now() - INTERVAL '1 day', now()),
(3, 2, 'REV-103', 'Lê Hoàng C', 'Sạc khá nóng máy, dung lượng có vẻ không đủ 20000mAh. Cần xem lại.', 2, 'shopee', now() - INTERVAL '5 hours', now()),
(4, 3, 'REV-104', 'Phạm Minh D', 'Gõ phím rất êm tay, đèn LED sang đẹp. Giao hàng thần tốc 24h nhận được liền!', 5, 'shopee', now() - INTERVAL '1 hour', now())
ON CONFLICT (id) DO NOTHING;

-- 5. Demo Review Aspects (ABSA aspect-level sentiments)
INSERT INTO review_aspects (id, review_id, aspect, sentiment, confidence_score, created_at)
VALUES 
(1, 1, 'Chất lượng âm thanh', 'positive', 0.92, now()),
(2, 1, 'Tính năng chống ồn', 'positive', 0.88, now()),
(3, 1, 'Dịch vụ giao hàng', 'negative', 0.85, now()),

(4, 2, 'Thời lượng pin', 'positive', 0.95, now()),
(5, 2, 'Tốc độ kết nối', 'positive', 0.91, now()),
(6, 2, 'Đóng gói sản phẩm', 'positive', 0.89, now()),

(7, 3, 'Nhiệt độ hoạt động', 'negative', 0.82, now()),
(8, 3, 'Dung lượng pin', 'negative', 0.78, now()),

(9, 4, 'Cảm giác gõ phím', 'positive', 0.94, now()),
(10, 4, 'Thiết kế đèn LED', 'positive', 0.90, now()),
(11, 4, 'Dịch vụ giao hàng', 'positive', 0.96, now())
ON CONFLICT (id) DO NOTHING;

-- Adjust sequence values to prevent duplicate key errors on new inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('shops_id_seq', (SELECT MAX(id) FROM shops));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('review_aspects_id_seq', (SELECT MAX(id) FROM review_aspects));
