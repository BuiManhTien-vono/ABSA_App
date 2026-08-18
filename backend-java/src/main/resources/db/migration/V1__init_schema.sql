-- ============================================================================
-- V1: Initial schema for FeedbackAI platform
-- ============================================================================

-- Users
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255),
    role          VARCHAR(50)  NOT NULL DEFAULT 'OWNER',
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

-- Shops
CREATE TABLE shops (
    id             BIGSERIAL    PRIMARY KEY,
    user_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform       VARCHAR(50)  NOT NULL,
    shop_name      VARCHAR(255) NOT NULL,
    access_token   TEXT,
    refresh_token  TEXT,
    token_expiry   TIMESTAMP,
    connected_at   TIMESTAMP    NOT NULL DEFAULT now(),
    status         VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX idx_shops_user_id ON shops(user_id);

-- Products
CREATE TABLE products (
    id           BIGSERIAL    PRIMARY KEY,
    shop_id      BIGINT       NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    external_id  VARCHAR(255),
    name         VARCHAR(500) NOT NULL,
    category     VARCHAR(255),
    image_url    TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_shop_id ON products(shop_id);

-- Reviews
CREATE TABLE reviews (
    id           BIGSERIAL    PRIMARY KEY,
    product_id   BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    external_id  VARCHAR(255),
    author_name  VARCHAR(255),
    content      TEXT         NOT NULL,
    rating       INTEGER,
    platform     VARCHAR(50),
    reviewed_at  TIMESTAMP,
    synced_at    TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_synced_at ON reviews(synced_at);

-- Review Aspects (1 review -> N aspects from ABSA model)
CREATE TABLE review_aspects (
    id               BIGSERIAL        PRIMARY KEY,
    review_id        BIGINT           NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    aspect           VARCHAR(255)     NOT NULL,
    sentiment        VARCHAR(50)      NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at       TIMESTAMP        NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_aspects_review_id ON review_aspects(review_id);
CREATE INDEX idx_review_aspects_sentiment ON review_aspects(sentiment);
CREATE INDEX idx_review_aspects_aspect ON review_aspects(aspect);

-- Alerts
CREATE TABLE alerts (
    id           BIGSERIAL    PRIMARY KEY,
    product_id   BIGINT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type         VARCHAR(100) NOT NULL,
    message      TEXT         NOT NULL,
    severity     VARCHAR(50)  NOT NULL DEFAULT 'WARNING',
    is_read      BOOLEAN      NOT NULL DEFAULT false,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_product_id ON alerts(product_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- Sync Logs
CREATE TABLE sync_logs (
    id             BIGSERIAL    PRIMARY KEY,
    shop_id        BIGINT       NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    status         VARCHAR(50)  NOT NULL,
    reviews_synced INTEGER      NOT NULL DEFAULT 0,
    error_message  TEXT,
    started_at     TIMESTAMP    NOT NULL DEFAULT now(),
    finished_at    TIMESTAMP
);
CREATE INDEX idx_sync_logs_shop_id ON sync_logs(shop_id);

-- Reports
CREATE TABLE reports (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(500) NOT NULL,
    type         VARCHAR(100) NOT NULL,
    status       VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    file_url     TEXT,
    parameters   JSONB,
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);
CREATE INDEX idx_reports_user_id ON reports(user_id);
