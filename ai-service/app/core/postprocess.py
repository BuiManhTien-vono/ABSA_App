"""Domain override rules and postprocessing logic for HIGEN-ABSA.

This module contains all regex-based domain override patterns, evidence
extraction rules, hierarchy correction, insight generation, and the full
postprocessing pipeline.

The rules were developed iteratively through regression testing against
real Vietnamese e-commerce review datasets.
"""

from __future__ import annotations

import re
from typing import Any

import numpy as np

from .model_bundle import ModelBundle, round_float, sigmoid, softmax
from .taxonomy import (
    INSIGHT_IGNORED_MICROS,
    MICRO_RECOMMENDATIONS,
    MICRO_TEXT,
    MICRO_TO_MACRO,
)
from .text_utils import clause_span_for_match


# ---------------------------------------------------------------------------
# Authenticity-specific patterns
# ---------------------------------------------------------------------------

AUTH_NEG_PATTERNS = [
    (re.compile(r"\bseal\s+bị\s+bóc(?:\s+sẵn)?\b|\bseal\s+bi\s+boc(?:\s+san)?\b", re.IGNORECASE), "seal bị bóc"),
    (re.compile(r"\bkhông\s+có\s+tem(?:\s+phụ)?\b|\bkhong\s+co\s+tem(?:\s+phu)?\b", re.IGNORECASE), "không có tem"),
    (re.compile(r"\bh[aà]ng\s+nh[aá]i\b", re.IGNORECASE), "hàng nhái"),
    (re.compile(r"\bh[aà]ng\s+gi[aả]\b", re.IGNORECASE), "hàng giả"),
    (re.compile(r"\bfake\b", re.IGNORECASE), "fake"),
    (re.compile(r"kh[oô]ng\s+(?:ph[aả]i\s+)?ch[ií]nh\s+h[aã]ng", re.IGNORECASE), "không chính hãng"),
    (re.compile(r"k(?:o|h[oô]ng)?\s+ch[ií]nh\s+h[aã]ng", re.IGNORECASE), "không chính hãng"),
    (re.compile(r"gi[aả]\s+m[aạ]o", re.IGNORECASE), "giả mạo"),
]

AUTH_NEG_EXCLUSIONS = [
    re.compile(r"kh[oô]ng\s+ph[aả]i\s+h[aà]ng\s+nh[aá]i", re.IGNORECASE),
    re.compile(r"kh[oô]ng\s+ph[aả]i\s+h[aà]ng\s+gi[aả]", re.IGNORECASE),
    re.compile(r"kh[oô]ng\s+fake", re.IGNORECASE),
]

AUTH_POS_PATTERNS = [
    (re.compile(r"\bmã\s+qr\s+check\s+ra\s+đúng\s+hãng\b|\bma\s+qr\s+check\s+ra\s+dung\s+hang\b", re.IGNORECASE), "mã QR check ra đúng hãng"),
    (re.compile(r"\bseal\s+còn\s+nguyên\b|\bseal\s+con\s+nguyen\b", re.IGNORECASE), "seal còn nguyên"),
    (re.compile(r"\bch[ií]nh\s+h[aã]ng\b", re.IGNORECASE), "chính hãng"),
    (re.compile(r"\bh[aà]ng\s+th[aậ]t\b", re.IGNORECASE), "hàng thật"),
    (re.compile(r"\bauth(?:entic)?\b", re.IGNORECASE), "authentic"),
]

POSITIVE_CUE_PATTERN = re.compile(
    r"\b(t[oố]t|[dđ][eẹ]p|[oô]n|ok|ưng|th[ií]ch|nhanh|ch[aắ]c\s+ch[aắ]n|xịn)\b",
    re.IGNORECASE,
)
CONTRAST_PATTERN = re.compile(r"\b(nhưng|nhg|tuy\s+nhi[eê]n|m[aà])\b", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Domain override rules (micro, sentiment, regex, reason)
# ---------------------------------------------------------------------------
# NOTE: This is the complete list copied from the production inference script.
# Each rule is a 4-tuple: (micro_aspect, sentiment, compiled_regex, reason_prefix)

DOMAIN_OVERRIDE_RULES = [
    (
        "Overall_Sentiment",
        "NEG",
        re.compile(r"\b(?:không\s+hài\s+lòng|khong\s+hai\s+long|hơi\s+thất\s+vọng|hoi\s+that\s+vong|thất\s+vọng|that\s+vong|trừ\s+1đ|tru\s+1d|1\s+sao\s+cho|không\s+thèm\s+ngó|khong\s+them\s+ngo|hơi\s+hối\s+hận|hoi\s+hoi\s+han|hối\s+hận|hoi\s+han)\b", re.IGNORECASE),
        "real_overall_negative_cue",
    ),
    (
        "Overall_Sentiment",
        "NEU",
        re.compile(r"\b(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|mua\s+về\s+chưa\s+dùng|mua\s+ve\s+chua\s+dung)\b", re.IGNORECASE),
        "real_overall_neutral_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"\b(?:ok\s+dùng\s+cũng\s+được|ok\s+dung\s+cung\s+duoc|(?:rất|rat|quá|qua)\s+(?:ok|okay|oke|ổn|on)|nói\s+chung\s+ok|noi\s+chung\s+ok|mọi\s+mặt\s+ok|moi\s+mat\s+ok|chất\s+lượng\s+tốt|chat\s+luong\s+tot|hàng\s+tốt|hang\s+tot|đáng\s+để\s+mua|dang\s+de\s+mua|vẫn\s+cho\s+shop\s+5\s+sao|van\s+cho\s+shop\s+5\s+sao|cho\s+shop\s+5\s*sao|10\s*đỉm|10\s*điểm|10\s*diem|sẽ\s+ủng\s+hộ|se\s+ung\s+ho|mẹ\s+thích\s+lắm|me\s+thich\s+lam|nhẹ\s*,\s*gọn\s*,\s*xinh|nhe\s*,\s*gon\s*,\s*xinh|nồi\s+đẹp|noi\s+dep|máy\s+đẹp|may\s+dep|mẫu\s+mã\s+đẹp|mau\s+ma\s+dep|hình\s+thức\s+đẹp|hinh\s+thuc\s+dep)\b|(?<!không\s)(?<!khong\s)\b(?:rất\s+)?hài\s+lòng\b", re.IGNORECASE),
        "real_overall_positive_cue",
    ),
    (
        "Performance_Functionality",
        "NEU",
        re.compile(r"\b(?:chưa\s+dùng\s+thử|chua\s+dung\s+thu|chưa\s+sử\s+dụng|chua\s+su\s+dung|chưa\s+xài|chua\s+xai|mua\s+về\s+chưa\s+dùng|mua\s+ve\s+chua\s+dung)\b", re.IGNORECASE),
        "real_performance_pending_cue",
    ),
    (
        "Performance_Functionality",
        "NEG",
        re.compile(r"\b(?:không\s+ngon(?:\s+lắm)?|khong\s+ngon(?:\s+lam)?|ko\s+ngon|k\s+ngon|không\s+giòn|khong\s+gion|không\s+béo|khong\s+beo|không\s+thơm|khong\s+thom|ít\s+kem|it\s+kem|phần\s+nhựa\s+gia\s+công\s+chưa\s+kỹ|phan\s+nhua\s+gia\s+cong\s+chua\s+ky|viền\s+đế\s+khá\s+bén|vien\s+de\s+kha\s+ben|không\s+tách\s+rời\s+được|khong\s+tach\s+roi\s+duoc|không\s+dựng\s+đứng\s+được|khong\s+dung\s+dung\s+duoc|lỗi\s+nhỏ|loi\s+nho)\b", re.IGNORECASE),
        "real_performance_negative_cue",
    ),
    (
        "Performance_Functionality",
        "POS",
        re.compile(r"\b(?:rất\s+ngon|rat\s+ngon|sữa\s+ngon|sua\s+ngon|bia\s+ngon|bánh\s+ngon|banh\s+ngon|trà\s+thơm|tra\s+thom|cafe\s+thơm|cà\s+phê\s+thơm|ca\s+phe\s+thom|hàng\s+mới\s*,\s*thơm|hang\s+moi\s*,\s*thom|thơm\s+lắm|thom\s+lam|thơm\s*,\s*ngọt|thom\s*,\s*ngot|uống\s+thơm|uong\s+thom|thơm\s+mạnh|thom\s+manh|uống\s+chơi\s+khá\s+hợp|uong\s+choi\s+kha\s+hop|không\s+chát\s+lắm|khong\s+chat\s+lam|gạo\s+nấu\s+lên\s+rất\s+thơm|gao\s+nau\s+len\s+rat\s+thom|dẻo\s+vừa\s+ăn|deo\s+vua\s+an|ngọt\s+thơm\s+tự\s+nhiên|ngot\s+thom\s+tu\s+nhien|bã\s+khô|ba\s+kho|chạy\s+êm|chay\s+em|quạt\s+chạy\s+êm|quat\s+chay\s+em|quạt\s+rất\s+mát|quat\s+rat\s+mat|mát\s+với\s+nhu\s+cầu|mat\s+voi\s+nhu\s+cau|máy\s+tập\s+tốt|may\s+tap\s+tot|hút\s+mạnh|hut\s+manh|hút\s+khỏe|hut\s+khoe|hút\s+sạch|hut\s+sach|giòn\s+rụm|gion\s+rum|đậm\s+vị|dam\s+vi|uống\s+cũng\s+ngon|uong\s+cung\s+ngon|uống\s+cũng\s+được|uong\s+cung\s+duoc|uống\s+rất\s+ok|uong\s+rat\s+ok|hoạt\s+động\s+đúng\s+chức\s+năng|hoat\s+dong\s+dung\s+chuc\s+nang|hoạt\s+động\s+tố\b|hoat\s+dong\s+to\b|máy\s+đánh\s+tơi|may\s+danh\s+toi)\b", re.IGNORECASE),
        "real_performance_positive_cue",
    ),
    (
        "Appearance_Design",
        "NEG",
        re.compile(r"\b(?:không\s+giống\s+hình(?:\s+chụp)?|khong\s+giong\s+hinh(?:\s+chup)?|không\s+giống\s+ảnh|khong\s+giong\s+anh|không\s+giống\s+nhau|khong\s+giong\s+nhau|khác\s+hình|khac\s+hinh|khác\s+ảnh|khac\s+anh)\b", re.IGNORECASE),
        "real_appearance_negative_cue",
    ),
    (
        "Appearance_Design",
        "POS",
        re.compile(r"\b(?:cute|dễ\s+thương|de\s+thuong|đẹp\s+mắt|dep\s+mat|bao\s+bì\s+hạt\s+dễ\s+thương|bao\s+bi\s+hat\s+de\s+thuong|hạt\s+gạo\s+thon\s+dài|hat\s+gao\s+thon\s+dai)\b", re.IGNORECASE),
        "real_appearance_positive_cue",
    ),
    (
        "Material_BuildQuality",
        "NEG",
        re.compile(r"\b(?:bị\s+nứt|bi\s+nut|bị\s+móp|bi\s+mop|bị\s+phồng|bi\s+phong|bị\s+xì|bi\s+xi|hư\s+như\s+vậy|hu\s+nhu\s+vay|gia\s+công\s+chưa\s+kỹ|gia\s+cong\s+chua\s+ky|khá\s+bén|kha\s+ben)\b", re.IGNORECASE),
        "real_material_negative_cue",
    ),
    (
        "External_Packaging",
        "POS",
        re.compile(r"\b(?:đóng\s+gói|dong\s+goi|gói\s+hàng|goi\s+hang|bao\s+bì|bao\s+bi)(?:\s+\w+){0,4}\s+(?:kỹ|kĩ|ky|cẩn\s+thận|can\s+than|đẹp|dep|chắc\s+chắn|chac\s+chan|nguyên\s+vẹn|nguyen\s+ven)\b|\b(?:túi|tui|hộp|hop|thùng|thung|hàng|hang)(?:\s+\w+){0,3}\s+(?:nguyên\s+vẹn|nguyen\s+ven|ép\s+chân\s+không|ep\s+chan\s+khong)\b", re.IGNORECASE),
        "real_packaging_positive_cue",
    ),
    (
        "External_Packaging",
        "NEG",
        re.compile(r"\b(?:bị\s+móp(?:\s+\w+){0,4}\s+thùng|bi\s+mop(?:\s+\w+){0,4}\s+thung|thùng(?:\s+\w+){0,4}\s+bị\s+móp|thung(?:\s+\w+){0,4}\s+bi\s+mop|vỏ\s+thùng(?:\s+\w+){0,4}\s+ướt|vo\s+thung(?:\s+\w+){0,4}\s+uot|gói\s+hơi\s+ẩu|goi\s+hoi\s+au|gói\s+ẩu|goi\s+au|bụi\s+bám|bui\s+bam)\b", re.IGNORECASE),
        "real_packaging_negative_cue",
    ),
    # ... Many more rules follow the same pattern.
    # The full list continues below in the same structure.
    (
        "Price_Promotion",
        "POS",
        re.compile(r"\b(?:mua\s+sale|mua\s+flash\s+sale|săn\s+sale\s+được|san\s+sale\s+duoc|giá\s+mềm|gia\s+mem|sale\s+được|sale\s+duoc|free\s+tikinow|tikinow\s+free|giá\s+siêu\s+hời|gia\s+sieu\s+hoi|voucher\s+\d+k|tặng\s+voucher|tang\s+voucher|đang\s+giảm\s+giá|dang\s+giam\s+gia|thêm\s+mã\s+giảm\s+giá|them\s+ma\s+giam\s+gia|mã\s+giảm\s+giá|ma\s+giam\s+gia)\b", re.IGNORECASE),
        "real_price_promotion_positive_cue",
    ),
    (
        "Price_Promotion",
        "NEG",
        re.compile(r"\b(?:khuyến\s+mãi\s+ghi\s+cho\s+có|khuyen\s+mai\s+ghi\s+cho\s+co|voucher\s+không\s+dùng\s+được|voucher\s+khong\s+dung\s+duoc|mã\s+giảm\s+giá\s+không\s+dùng\s+được|ma\s+giam\s+gia\s+khong\s+dung\s+duoc)\b", re.IGNORECASE),
        "hardcase_price_promotion_negative_cue",
    ),
    (
        "Intent_QA",
        "NEU",
        re.compile(r"\b(?:shop\s+ơi|shop\s+oi|shop\s+à|shop\s+a|xin\s+hỏi|xin\s+hoi|đổi\s+được\s+không|doi\s+duoc\s+khong|được\s+không\s+ạ|duoc\s+khong\s+a|không\s+shop|khong\s+shop|làm\s+thế\s+nào|lam\s+the\s+nao|ntn|có\s+bền\s+không|co\s+ben\s+khong)\b|\?\!?", re.IGNORECASE),
        "real_intent_qa_cue",
    ),
    (
        "Performance_Functionality",
        "NEU",
        re.compile(r"\b(?:dùng\s+cũng\s+được|dung\s+cung\s+duoc)\b", re.IGNORECASE),
        "hardcase_performance_neutral_cue",
    ),
    (
        "Delivery_Speed",
        "NEU",
        re.compile(r"\b(?:thời\s+gian\s+giao\s+như\s+dự\s+kiến|thoi\s+gian\s+giao\s+nhu\s+du\s+kien)\b", re.IGNORECASE),
        "hardcase_delivery_neutral_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"(?:^|[.!?,;]\s*|\b(?:còn|với\s+lại|nhưng|mà|con|voi\s+lai|nhung|ma)\s+)(?:ok|okay|oke|tốt|tot|ổn|on)(?:\s*(?:nha|nhé|nhe|ạ|a|nè|ne))?(?=$|[\s,.;!?])|\b(?<!không\s)(?<!khong\s)(?<!ko\s)(?<!k\s)(?:rất\s+|rat\s+|quá\s+|qua\s+|khá\s+|kha\s+|cũng\s+|cung\s+|vẫn\s+|van\s+|đều\s+|deu\s+|thì\s+|thi\s+)?(?:ok|okay|oke|ổn|on)(?:\s*(?:nha|nhé|nhe|ạ|a|nè|ne|luôn|luon|lắm|lam))?(?!\s+không)(?=$|[\s,.;!?])|\b(?:dùng|dung|xài|xai|sài|sai|chạy|chay|sử\s+dụng|su\s+dung)(?:\s+\w+){0,4}\s+(?:ok|okay|oke|ổn|on|tốt|tot)\b|\b(?:đáng\s+mua|dang\s+mua|so\s+ok|5\s*sao|cho\s+shop\s+điểm\s+5|cho\s+shop\s+diem\s+5|sẽ\s+ủng\s+hộ|se\s+ung\s+ho|nên\s+mua|nen\s+mua|10\s*/\s*10)\b", re.IGNORECASE),
        "hardcase_clause_overall_positive_cue",
    ),
    (
        "Spam_Noise",
        "NEU",
        re.compile(r"\b(?:nhận\s+xu|lấy\s+xu|đủ\s+ký\s+tự)\b|\.{4,}|(?:a{4,}|k{4,})", re.IGNORECASE),
        "spam_noise_cue",
    ),
    (
        "Overall_Sentiment",
        "NEG",
        re.compile(r"\b(?:không|khong|ko|k)\s+(?:ổn|on|ok|oke|được|duoc|ưng|ung)\b|\b(?:tệ|te|chán|chan|fail)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:(?:không|khong|ko|k)\s+(?:ổn|on|ok|oke|được|duoc|ưng|ung)|(?:tệ|te|chán|chan|fail|lỗi|loi|hỏng|hong))\s*(?:[.!…]+)?\s*$", re.IGNORECASE),
        "short_overall_negative_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"\b(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+(?:ok|oke|okela|okla|ổn|on|được|duoc|tốt|tot|ưng|ung|đều|deu)\b|\b(?:okela|okla|oke|ưng|ung|ổn\s+nha|on\s+nha|được\s+nha|duoc\s+nha)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:ok|oke|okela|okla|ổn|on|được|duoc|tốt|tot|ưng|ung|đều|deu)\s*(?:nha|nhé|nhe|ạ|a|luôn|lun|lắm|lam|quá|qua)?\s*(?:[.!…]+)?\s*$", re.IGNORECASE),
        "short_overall_positive_cue",
    ),
    (
        "Overall_Sentiment",
        "NEU",
        re.compile(r"\b(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|bt|bth|cũng\s+được|cung\s+duoc|chưa\s+dùng|chua\s+dung|đã\s+nhận|da\s+nhan|nhận\s+hàng\s+rồi|nhan\s+hang\s+roi)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|bt|bth|cũng\s+được|cung\s+duoc|chưa\s+dùng|chua\s+dung|đã\s+nhận|da\s+nhan|nhận\s+hàng\s+rồi|nhan\s+hang\s+roi)\s*(?:[.!…]+)?\s*$", re.IGNORECASE),
        "short_overall_neutral_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"\b(?:rất\s+thích|rat\s+thich|tương\s+đối\s+ổn|tuong\s+doi\s+on|khá\s+ổn|kha\s+on|ưng\s+ý|ung\s+y|hài\s+lòng|hai\s+long|okela|không\s+có\s+gì\s+để\s+chê|khong\s+co\s+gi\s+de\s+che)\b", re.IGNORECASE),
        "overall_positive_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"\bkhông\s+hề\s+thất\s+vọng\b|\b(?:khong\s+he\s+that\s+vong)\b", re.IGNORECASE),
        "overall_positive_negation_cue",
    ),
    (
        "Overall_Sentiment",
        "NEG",
        re.compile(r"\b(?:không|ko|k)\s+mua\s+(?:lại|nữa)\b|\b(?:khong|ko|k)\s+mua\s+(?:lai|nua)\b|\bthat\s+vong\b", re.IGNORECASE),
        "overall_negative_cue",
    ),
    (
        "Overall_Sentiment",
        "POS",
        re.compile(r"\b(?:sẽ|se)\s+mua\s+(?:lại|lai)\b|\bokela\b|\bnhận\s+hàng\s+khá\s+ổn\b", re.IGNORECASE),
        "overall_positive_cue",
    ),
    # Generic aspect patterns
    (
        "Delivery_Speed",
        "POS",
        re.compile(r"\b(?:nhận\s+hàng|nhan\s+hang)(?:\s+\w+){0,3}\s+(?:nhanh|sớm|som)\b", re.IGNORECASE),
        "delivery_speed_positive_cue",
    ),
    (
        "Delivery_Speed",
        "NEG",
        re.compile(r"\b(?:giao|ship|vận\s+chuyển|van\s+chuyen)(?:\s+hàng|\s+hang)?(?:\s+\w+){0,2}\s+(?:không\s+nhanh|khong\s+nhanh|lâu|lau|chậm|cham|trễ|tre)\b|\bchờ(?:\s+\w+){0,3}\s+lâu\b", re.IGNORECASE),
        "delivery_speed_negative_cue",
    ),
    (
        "Delivery_Speed",
        "POS",
        re.compile(r"\b(?:giao|ship|van\s+chuyen)(?:\s+hang)?(?:\s+\w+){0,2}\s+(?:nhanh|dung\s+hen|som)\b", re.IGNORECASE),
        "delivery_speed_positive_cue",
    ),
    (
        "Performance_Functionality",
        "NEG",
        re.compile(r"\b(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+(?:lỗi|loi|hỏng|hong)\b", re.IGNORECASE),
        "short_product_broken_cue",
    ),
    (
        "Appearance_Design",
        "POS",
        re.compile(r"\b(?:đẹp|xinh|sang|mẫu\s+mã\s+đẹp|màu\s+đẹp|form\s+đẹp|thiết\s+kế\s+đẹp)\b", re.IGNORECASE),
        "appearance_positive_cue",
    ),
    (
        "Appearance_Design",
        "NEG",
        re.compile(r"\b(?:xấu|móp\s+méo|trầy|xước|bể|vỡ|nứt|màu\s+xấu|sai\s+màu)\b", re.IGNORECASE),
        "appearance_negative_cue",
    ),
    (
        "Material_BuildQuality",
        "POS",
        re.compile(r"\b(?:chất\s+liệu|chat\s+lieu|vải|vai)(?:\s+\w+){0,4}\s+(?:mềm|mem|mịn|min|tot|tốt|on|ổn|dày|day)\b", re.IGNORECASE),
        "material_positive_cue",
    ),
    (
        "Material_BuildQuality",
        "NEG",
        re.compile(r"\bvải(?:\s+\w+){0,3}\s+(?:mỏng|xấu|kém|rách|lỗi)\b", re.IGNORECASE),
        "material_negative_cue",
    ),
    (
        "Performance_Functionality",
        "POS",
        re.compile(r"\b(?:không|khong|ko)\s+lỗi\b|\b(?:may|máy|pin|sạc|sac|chạy|chay|dùng|dung)(?:\s+\w+){0,4}\s+(?:em|êm|trau|trâu|ben|bền|on|ổn|tot|tốt|muot|mượt)\b|\b(?:bền|ben)\b", re.IGNORECASE),
        "performance_positive_cue",
    ),
    (
        "Performance_Functionality",
        "NEG",
        re.compile(r"\b(?:san\s+pham\s+loi|sản\s+phẩm\s+bị\s+lỗi|bị\s+lỗi|bi\s+loi|ko\s+dung\s+duoc|khong\s+dung\s+duoc|không\s+dùng\s+được|pin\s+tụt|pin\s+tut|pin\s+yếu|pin\s+yeu|sạc\s+nóng|sac\s+nong|nóng|nong|hư|hu|hỏng|hong)\b", re.IGNORECASE),
        "performance_negative_cue",
    ),
    (
        "External_Packaging",
        "POS",
        re.compile(r"\b(?:đóng\s+gói|gói\s+hàng|bọc)(?:\s+\w+){0,3}\s+(?:kỹ|cẩn\s+thận|chắc|đẹp)\b", re.IGNORECASE),
        "external_packaging_positive_cue",
    ),
    (
        "External_Packaging",
        "NEG",
        re.compile(r"\b(?:đóng\s+gói|gói\s+hàng|hộp|bao\s+bì)(?:\s+\w+){0,3}\s+(?:móp|méo|rách|ẩu|kém)\b|\b(?:giao\s+thiếu\s+hàng|thiếu\s+hàng)\b", re.IGNORECASE),
        "external_packaging_negative_cue",
    ),
    (
        "Response_Time",
        "POS",
        re.compile(r"\b(?:rep|phản\s+hồi|trả\s+lời|chat|inbox)(?:\s+\w+){0,3}\s+(?:nhanh|sớm|ngay|liền)\b", re.IGNORECASE),
        "response_time_positive_cue",
    ),
    (
        "Response_Time",
        "NEG",
        re.compile(r"\b(?:rep|phản\s+hồi|trả\s+lời|chat|inbox)(?:\s+\w+){0,3}\s+(?:chậm|lâu|trễ)\b", re.IGNORECASE),
        "response_time_negative_cue",
    ),
    (
        "Response_Time",
        "NEG",
        re.compile(r"\bkhông\s+(?:rep|phản\s+hồi|trả\s+lời)\b", re.IGNORECASE),
        "response_time_negative_cue",
    ),
    (
        "Consulting_Attitude",
        "POS",
        re.compile(r"\b(?:shop|nhân\s+viên|tư\s+vấn|hỗ\s+trợ|rep)(?:\s+\w+){0,3}\s+(?:nhiệt\s+tình|lịch\s+sự|dễ\s+thương|vui\s+vẻ|tốt)\b", re.IGNORECASE),
        "consulting_attitude_positive_cue",
    ),
    (
        "Consulting_Attitude",
        "NEG",
        re.compile(r"\b(?:shop|nhân\s+viên|tư\s+vấn|hỗ\s+trợ)(?:\s+\w+){0,3}\s+(?:thái\s+độ|cọc|khó\s+chịu|tệ|kém)\b", re.IGNORECASE),
        "consulting_attitude_negative_cue",
    ),
    (
        "Price_Promotion",
        "POS",
        re.compile(r"\b(?:giá|voucher|khuyến\s+mãi|sale)(?:\s+\w+){0,3}\s+(?:tốt|rẻ|hời|ổn)\b", re.IGNORECASE),
        "price_positive_cue",
    ),
    (
        "Price_Promotion",
        "NEG",
        re.compile(r"\b(?:hơi\s+)?(?:mắc|đắt)\b|\b(?:giá|gia)(?:\s+\w+){0,3}\s+(?:cao|đắt|mắc)\b", re.IGNORECASE),
        "price_negative_cue",
    ),
    (
        "Price_Performance_Ratio",
        "POS",
        re.compile(r"\b(?:đáng\s+tiền|xứng\s+đáng|đáng\s+mua|hợp\s+giá)\b", re.IGNORECASE),
        "price_performance_positive_cue",
    ),
    (
        "Price_Performance_Ratio",
        "NEG",
        re.compile(r"\b(?:không\s+đáng|không\s+xứng|phí\s+tiền|tiền\s+nào\s+của\s+nấy)\b", re.IGNORECASE),
        "price_performance_negative_cue",
    ),
    (
        "Shipping_Fee",
        "POS",
        re.compile(r"\b(?:freeship|free\s+ship|miễn\s+phí\s+ship|phí\s+ship\s+rẻ|ship\s+rẻ)\b", re.IGNORECASE),
        "shipping_fee_positive_cue",
    ),
    (
        "Shipping_Fee",
        "NEG",
        re.compile(r"\b(?:phí\s+ship|tiền\s+ship|ship)(?:\s+\w+){0,3}\s+(?:cao|đắt|mắc)\b", re.IGNORECASE),
        "shipping_fee_negative_cue",
    ),
    (
        "AfterSales_Complaint",
        "POS",
        re.compile(r"\b(?:đổi\s+trả|bảo\s+hành|hoàn\s+tiền|xử\s+lý)(?:\s+\w+){0,3}\s+(?:nhanh|tốt|ổn|dễ)\b", re.IGNORECASE),
        "aftersales_positive_cue",
    ),
    (
        "AfterSales_Complaint",
        "NEG",
        re.compile(r"\b(?:đổi\s+trả|bảo\s+hành|hoàn\s+tiền|khiếu\s+nại|xử\s+lý)(?:\s+\w+){0,4}\s+(?:chậm|khó|tệ|không)\b", re.IGNORECASE),
        "aftersales_negative_cue",
    ),
    (
        "Usability_Experience",
        "POS",
        re.compile(r"\b(?:mặc|mac|dùng|dung|sử\s+dụng|su\s+dung)(?:\s+\w+){0,4}\s+(?:thoải\s+mái|thoai\s+mai|dễ\s+dùng|de\s+dung|vừa\s+vặn|vua\s+van)\b", re.IGNORECASE),
        "usability_positive_cue",
    ),
    (
        "Usability_Experience",
        "NEG",
        re.compile(r"\b(?:mặc\s+bị\s+ngứa|mac\s+bi\s+ngua|khó\s+chịu|kho\s+chiu|lắp\s+không\s+được|lap\s+khong\s+duoc|không\s+lắp\s+được|khong\s+lap\s+duoc)\b", re.IGNORECASE),
        "usability_negative_cue",
    ),
    (
        "Intent_QA",
        "NEU",
        re.compile(r"\b(?:cho\s+hỏi|mình\s+hỏi|bao\s+giờ|ở\s+đâu|như\s+thế\s+nào)\b|\b(?:có|còn)(?:\s+\w+){1,6}\s+không\b|\?", re.IGNORECASE),
        "intent_question_cue",
    ),
    (
        "Performance_Functionality",
        "NEU",
        re.compile(r"\b(?:chưa\s+dùng|chưa\s+sử\s+dụng|chưa\s+test|chưa\s+đánh\s+giá)\b", re.IGNORECASE),
        "performance_neutral_cue",
    ),
    (
        "Performance_Functionality",
        "NEG",
        re.compile(r"\b(?:hỏng|bị\s+lỗi|sản\s+phẩm\s+bị\s+lỗi|không\s+lên|không\s+chạy|không\s+dùng\s+được|không\s+hoạt\s+động|pin\s+tụt|pin\s+yếu|sạc\s+không\s+lên)\b", re.IGNORECASE),
        "performance_negative_cue",
    ),
    (
        "Performance_Functionality",
        "POS",
        re.compile(r"\b(?:hoạt\s+động|chạy|dùng|sử\s+dụng|pin|sạc)(?:\s+\w+){0,3}\s+(?:tốt|ổn|ngon|bền|mượt)\b", re.IGNORECASE),
        "performance_positive_cue",
    ),
]


# Evidence cue patterns for attaching evidence to model-predicted aspects
EVIDENCE_CUE_PATTERNS: dict[str, list[re.Pattern]] = {
    "Performance_Functionality": [
        re.compile(r"\b(?:hoạt\s+động|chạy|dùng|sử\s+dụng|pin|sạc|hỏng|lỗi|không\s+dùng\s+được|không\s+hoạt\s+động)\b", re.IGNORECASE)
    ],
    "Usability_Experience": [
        re.compile(r"\b(?:tiện|tiện\s+lợi|dễ\s+dùng|khó\s+dùng|thoải\s+mái|bất\s+tiện|phù\s+hợp)\b", re.IGNORECASE)
    ],
    "Authenticity_Packaging": [
        re.compile(r"\b(?:chính\s+hãng|fake|hàng\s+giả|hàng\s+nhái|tem|seal|bao\s+bì|đúng\s+mô\s+tả|sai\s+mô\s+tả)\b", re.IGNORECASE)
    ],
    "Courier_Attitude": [
        re.compile(r"\b(?:shipper|người\s+giao\s+hàng|nhân\s+viên\s+giao\s+hàng)(?:\s+\w+){0,3}\s+(?:nhiệt\s+tình|lịch\s+sự|khó\s+chịu|tệ|vui\s+vẻ)\b", re.IGNORECASE)
    ],
    "Shipping_Fee": [
        re.compile(r"\b(?:phí\s+ship|tiền\s+ship|freeship|free\s+ship|mã\s+vận\s+chuyển|ship\s+cao|ship\s+rẻ)\b", re.IGNORECASE)
    ],
    "Overall_Sentiment": [
        re.compile(r"\b(?:hài\s+lòng|thất\s+vọng|ưng|tuyệt\s+vời|quá\s+tệ|không\s+hài\s+lòng|sẽ\s+mua\s+tiếp|không\s+mua\s+lại)\b", re.IGNORECASE)
    ],
    "Spam_Noise": [
        re.compile(r"\b(?:nhận\s+xu|lấy\s+xu|đủ\s+ký\s+tự)\b|\.{4,}|(?:a{4,}|k{4,})", re.IGNORECASE)
    ],
    "Intent_QA": [
        re.compile(r"\b(?:cho\s+hỏi|mình\s+hỏi|bao\s+giờ|ở\s+đâu|như\s+thế\s+nào|có\s+không)\b|\?", re.IGNORECASE)
    ],
}


# ---------------------------------------------------------------------------
# Override detection
# ---------------------------------------------------------------------------

def has_mixed_auth_context(text: str) -> bool:
    return bool(POSITIVE_CUE_PATTERN.search(text) and CONTRAST_PATTERN.search(text))


def override_from_match(
    text: str,
    micro: str,
    sentiment: str,
    reason_prefix: str,
    match: re.Match[str],
) -> dict[str, Any]:
    start, end, evidence = clause_span_for_match(text, match.start(), match.end())
    cue = match.group(0).strip()
    return {
        "macro": MICRO_TO_MACRO[micro],
        "micro": micro,
        "sentiment": sentiment,
        "reason": f"{reason_prefix}:{cue}",
        "overall_hint": None,
        "evidence": evidence,
        "evidence_start": start,
        "evidence_end": end,
    }


def dedupe_overrides(overrides: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[tuple[str, str, str]] = set()
    deduped = []
    for override in overrides:
        key = (
            override["micro"],
            override["sentiment"],
            override.get("evidence", "").casefold(),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(override)
    return deduped


def detect_domain_overrides(text: str) -> list[dict[str, Any]]:
    """Detect domain-specific overrides from regex patterns in text."""
    overrides: list[dict[str, Any]] = []

    # Authenticity patterns
    if not any(pattern.search(text) for pattern in AUTH_NEG_EXCLUSIONS):
        auth_negative_found = False
        for pattern, cue in AUTH_NEG_PATTERNS:
            match = pattern.search(text)
            if not match:
                continue
            start, end, evidence = clause_span_for_match(text, match.start(), match.end())
            overrides.append({
                "macro": "PRODUCT",
                "micro": "Authenticity_Packaging",
                "sentiment": "NEG",
                "reason": f"authenticity_negative_cue:{cue}",
                "overall_hint": "MIXED" if has_mixed_auth_context(text) else "NEG",
                "evidence": evidence,
                "evidence_start": start,
                "evidence_end": end,
            })
            auth_negative_found = True
            break
        if not auth_negative_found:
            for pattern, cue in AUTH_POS_PATTERNS:
                match = pattern.search(text)
                if not match:
                    continue
                start, end, evidence = clause_span_for_match(text, match.start(), match.end())
                overrides.append({
                    "macro": "PRODUCT",
                    "micro": "Authenticity_Packaging",
                    "sentiment": "POS",
                    "reason": f"authenticity_positive_cue:{cue}",
                    "overall_hint": None,
                    "evidence": evidence,
                    "evidence_start": start,
                    "evidence_end": end,
                })
                break

    # General domain override rules
    for micro, sentiment, pattern, reason_prefix in DOMAIN_OVERRIDE_RULES:
        match = pattern.search(text)
        if match:
            overrides.append(
                override_from_match(text, micro, sentiment, reason_prefix, match)
            )

    return dedupe_overrides(overrides)


# ---------------------------------------------------------------------------
# Sentiment picking
# ---------------------------------------------------------------------------

def pick_sentiment(
    micro: str,
    scores: np.ndarray,
    thresholds: np.ndarray,
    micro_sentiments: list[str],
    sentiments: list[str],
) -> dict[str, Any]:
    candidates = []
    for sentiment in sentiments:
        key = f"{micro}__{sentiment}"
        if key not in micro_sentiments:
            continue
        idx = micro_sentiments.index(key)
        score = float(scores[idx])
        threshold = float(thresholds[idx])
        candidates.append({
            "sentiment": sentiment,
            "score": score,
            "threshold": threshold,
            "passed_threshold": score >= threshold,
        })
    passed = [item for item in candidates if item["passed_threshold"]]
    chosen = max(passed or candidates, key=lambda item: item["score"])
    return {
        "sentiment": chosen["sentiment"],
        "sentiment_score": round_float(chosen["score"]),
        "sentiment_threshold": round_float(chosen["threshold"]),
        "sentiment_passed_threshold": bool(chosen["passed_threshold"]),
    }


# ---------------------------------------------------------------------------
# Label management
# ---------------------------------------------------------------------------

def upsert_label(labels: list[dict[str, Any]], label: str, source: str) -> None:
    if any(item["label"] == label for item in labels):
        return
    labels.append({"label": label, "score": 1.0, "threshold": None, "source": source})


def apply_domain_overrides(result: dict[str, Any], overrides: list[dict[str, Any]]) -> None:
    """Merge domain overrides into prediction result."""
    if not overrides:
        return
    applied = []
    for override in overrides:
        macro = override["macro"]
        micro = override["micro"]
        sentiment = override["sentiment"]
        reason = override["reason"]

        upsert_label(result["macros"], macro, "domain_override")
        upsert_label(result["micros"], micro, "domain_override")

        override_evidence = override.get("evidence")
        conflicting = next(
            (
                item
                for item in result["aspect_sentiments"]
                if item["micro"] == micro
                and item.get("evidence")
                and override_evidence
                and item.get("sentiment") != sentiment
                and (
                    item["evidence"].casefold() in override_evidence.casefold()
                    or override_evidence.casefold() in item["evidence"].casefold()
                )
            ),
            None,
        )
        if conflicting is not None:
            conflicting_source = str(conflicting.get("source") or "")
            if "domain_override" not in conflicting_source:
                conflicting["model_sentiment"] = conflicting.get("sentiment")
                conflicting["sentiment"] = sentiment
                conflicting["source"] = (
                    f"{conflicting_source}+domain_override"
                    if conflicting_source
                    else "model+domain_override"
                )
                conflicting["override_reason"] = reason
                if override.get("evidence"):
                    conflicting["evidence"] = override["evidence"]
                    conflicting["evidence_start"] = override["evidence_start"]
                    conflicting["evidence_end"] = override["evidence_end"]
                    conflicting["evidence_source"] = "domain_override"
                applied.append(override)
                continue
            result.setdefault("postprocess", {}).setdefault("skipped_overrides", []).append(override)
            continue

        existing = next(
            (
                item
                for item in result["aspect_sentiments"]
                if item["micro"] == micro
                and (not item.get("evidence") or item.get("evidence") == override_evidence)
            ),
            None,
        )
        if (
            existing is not None
            and existing.get("evidence")
            and override_evidence
            and existing.get("sentiment") != sentiment
            and (
                existing["evidence"].casefold() in override_evidence.casefold()
                or override_evidence.casefold() in existing["evidence"].casefold()
            )
        ):
            result.setdefault("postprocess", {}).setdefault("skipped_overrides", []).append(override)
            continue

        if existing is None:
            aspect = {
                "macro": macro,
                "micro": micro,
                "sentiment": sentiment,
                "aspect_score": 1.0,
                "aspect_threshold": None,
                "sentiment_score": 1.0,
                "sentiment_threshold": None,
                "sentiment_passed_threshold": True,
                "source": "domain_override",
                "override_reason": reason,
            }
            if override.get("evidence"):
                aspect.update({
                    "evidence": override["evidence"],
                    "evidence_start": override["evidence_start"],
                    "evidence_end": override["evidence_end"],
                    "evidence_source": "domain_override",
                })
            result["aspect_sentiments"].append(aspect)
        else:
            existing["model_sentiment"] = existing["sentiment"]
            existing["sentiment"] = sentiment
            existing["source"] = "model+domain_override"
            existing["override_reason"] = reason
            if override.get("evidence"):
                existing["evidence"] = override["evidence"]
                existing["evidence_start"] = override["evidence_start"]
                existing["evidence_end"] = override["evidence_end"]
                existing["evidence_source"] = "domain_override"

        if override.get("overall_hint"):
            overall = result["overall_sentiment"]
            model_label = overall.get("model_label", overall["label"])
            model_score = overall.get("model_score", overall["score"])
            overall["model_label"] = model_label
            overall["model_score"] = model_score
            overall["label"] = override["overall_hint"]
            overall["score"] = 0.75
            overall["source"] = "domain_override"
            overall["override_reason"] = reason
        applied.append(override)
    result.setdefault("postprocess", {}).setdefault("domain_overrides", []).extend(applied)


# ---------------------------------------------------------------------------
# Evidence attachment
# ---------------------------------------------------------------------------

def find_evidence_for_micro(text: str, micro: str) -> tuple[int, int, str, str] | None:
    for rule_micro, _sentiment, pattern, reason_prefix in DOMAIN_OVERRIDE_RULES:
        if rule_micro != micro:
            continue
        match = pattern.search(text)
        if match:
            start, end, evidence = clause_span_for_match(text, match.start(), match.end())
            return start, end, evidence, reason_prefix
    for pattern in EVIDENCE_CUE_PATTERNS.get(micro, []):
        match = pattern.search(text)
        if match:
            start, end, evidence = clause_span_for_match(text, match.start(), match.end())
            return start, end, evidence, "evidence_cue"
    return None


def attach_rule_evidence(result: dict[str, Any], text: str) -> None:
    missing = []
    for aspect in result["aspect_sentiments"]:
        evidence = aspect.get("evidence")
        if evidence:
            start = aspect.get("evidence_start")
            end = aspect.get("evidence_end")
            if isinstance(start, int) and isinstance(end, int) and text[start:end] == evidence:
                continue
        found = find_evidence_for_micro(text, aspect["micro"])
        if found is None:
            missing.append(aspect["micro"])
            continue
        start, end, evidence, source = found
        aspect["evidence"] = evidence
        aspect["evidence_start"] = start
        aspect["evidence_end"] = end
        aspect["evidence_source"] = source
    if missing:
        result.setdefault("postprocess", {})["missing_evidence"] = missing


# ---------------------------------------------------------------------------
# Hierarchy correction
# ---------------------------------------------------------------------------

def apply_hierarchy_correction(result: dict[str, Any]) -> None:
    corrected = []
    for aspect in result["aspect_sentiments"]:
        parent = MICRO_TO_MACRO.get(aspect["micro"])
        if not parent:
            continue
        if aspect.get("macro") != parent:
            aspect["model_macro"] = aspect.get("macro")
            aspect["macro"] = parent
            corrected.append(aspect["micro"])
        before = len(result["macros"])
        upsert_label(result["macros"], parent, "hierarchy_correction")
        if len(result["macros"]) > before:
            corrected.append(parent)
    if corrected:
        result.setdefault("postprocess", {})["hierarchy_corrections"] = corrected


# ---------------------------------------------------------------------------
# Unfounded aspect removal
# ---------------------------------------------------------------------------

def remove_unfounded_special_aspects(result: dict[str, Any]) -> None:
    """Remove aspects that lack proper evidence or have contradictory signals."""
    kept = []
    removed = []
    for aspect in result["aspect_sentiments"]:
        micro = aspect["micro"]
        evidence_text = str(aspect.get("evidence") or "").casefold()

        if not aspect.get("evidence"):
            removed.append(micro)
            continue

        # Skip aspects with "xin lỗi" in evidence (not Performance related)
        if micro == "Performance_Functionality" and "xin lỗi" in evidence_text:
            removed.append(micro)
            continue

        kept.append(aspect)

    if not removed:
        return
    result["aspect_sentiments"] = kept
    active_micros = {aspect["micro"] for aspect in kept}
    result["micros"] = [item for item in result["micros"] if item["label"] in active_micros]
    active_macros = {MICRO_TO_MACRO[micro] for micro in active_micros if micro in MICRO_TO_MACRO}
    result["macros"] = [
        item
        for item in result["macros"]
        if item["label"] in active_macros or item.get("source") != "hierarchy_correction"
    ]
    result.setdefault("postprocess", {})["removed_aspects"] = removed


# ---------------------------------------------------------------------------
# Macro sync and overall derivation
# ---------------------------------------------------------------------------

def sync_macro_labels_to_aspects(result: dict[str, Any]) -> None:
    active_macros = {
        aspect["macro"] for aspect in result["aspect_sentiments"] if aspect.get("macro")
    }
    removed = [item["label"] for item in result["macros"] if item["label"] not in active_macros]
    result["macros"] = [item for item in result["macros"] if item["label"] in active_macros]
    for macro in active_macros:
        upsert_label(result["macros"], macro, "aspect_sync")
    if removed:
        result.setdefault("postprocess", {})["macro_sync_removed"] = removed


def derive_overall_from_aspects(result: dict[str, Any]) -> None:
    sentiments = {
        aspect["sentiment"]
        for aspect in result["aspect_sentiments"]
        if aspect["micro"] not in INSIGHT_IGNORED_MICROS and aspect["sentiment"] != "NEU"
    }
    if {"POS", "NEG"}.issubset(sentiments):
        derived = "MIXED"
    elif "NEG" in sentiments:
        derived = "NEG"
    elif "POS" in sentiments:
        derived = "POS"
    elif result["aspect_sentiments"]:
        derived = "NEU"
    else:
        derived = result["overall_sentiment"]["label"]

    overall = result["overall_sentiment"]
    if overall["label"] == derived:
        return
    overall["model_label"] = overall.get("model_label", overall["label"])
    overall["model_score"] = overall.get("model_score", overall["score"])
    overall["label"] = derived
    overall["score"] = 0.8 if derived == "MIXED" else 0.7
    overall["source"] = "aspect_sentiment_rule"


def add_comment_flags(result: dict[str, Any]) -> None:
    micros = {aspect["micro"] for aspect in result["aspect_sentiments"]}
    result["spam"] = "Spam_Noise" in micros
    result["intent_qa"] = "Intent_QA" in micros


# ---------------------------------------------------------------------------
# Insight generation (template-based)
# ---------------------------------------------------------------------------

def unique_texts(items: list[str]) -> list[str]:
    seen: set[str] = set()
    output = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        output.append(item)
    return output


def join_vietnamese(items: list[str]) -> str:
    items = unique_texts([item for item in items if item])
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} và {items[1]}"
    return f"{', '.join(items[:-1])} và {items[-1]}"


def join_recommendations(items: list[str]) -> str:
    items = unique_texts([item for item in items if item])
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return "; đồng thời ".join(items)


def aspect_terms(aspects: list[dict[str, Any]], sentiment: str) -> list[str]:
    return [
        MICRO_TEXT.get(aspect["micro"], aspect["micro"])
        for aspect in aspects
        if aspect["sentiment"] == sentiment and aspect["micro"] not in INSIGHT_IGNORED_MICROS
    ]


def build_template_insight(result: dict[str, Any]) -> dict[str, str]:
    aspects = result["aspect_sentiments"]
    positive = join_vietnamese(aspect_terms(aspects, "POS"))
    negative = join_vietnamese(aspect_terms(aspects, "NEG"))
    neutral = join_vietnamese(aspect_terms(aspects, "NEU"))

    if positive and negative:
        customer_insight = (
            f"Khách hàng hài lòng với {positive}, nhưng chưa hài lòng về {negative}."
        )
    elif negative:
        customer_insight = f"Khách hàng chưa hài lòng về {negative}."
    elif positive:
        customer_insight = f"Khách hàng hài lòng với {positive}."
    elif neutral:
        customer_insight = f"Khách hàng có phản hồi trung tính liên quan đến {neutral}."
    else:
        customer_insight = "Chưa có đủ tín hiệu rõ ràng để rút ra insight theo khía cạnh."

    negative_micros = unique_texts([
        aspect["micro"]
        for aspect in aspects
        if aspect["sentiment"] == "NEG" and aspect["micro"] in MICRO_RECOMMENDATIONS
    ])
    if negative_micros:
        root_cause = f"Vấn đề chính nằm ở {join_vietnamese([MICRO_TEXT[m] for m in negative_micros])}."
        business_recommendation = (
            "Nên "
            + join_recommendations([MICRO_RECOMMENDATIONS[m] for m in negative_micros])
            + "."
        )
    else:
        root_cause = "Không phát hiện nguyên nhân tiêu cực rõ ràng từ các khía cạnh dự đoán."
        business_recommendation = "Nên duy trì các điểm đang được khách hàng đánh giá tích cực."

    if positive and negative:
        suggested_seller_response = (
            f"Shop cảm ơn bạn đã góp ý. Shop rất vui vì bạn hài lòng với {positive}; "
            f"đồng thời shop ghi nhận các vấn đề về {negative} để kiểm tra và cải thiện trong các đơn tiếp theo."
        )
    elif negative:
        suggested_seller_response = (
            f"Shop xin lỗi vì trải nghiệm của bạn chưa tốt về {negative}. "
            "Shop ghi nhận phản hồi này và sẽ kiểm tra lại để cải thiện."
        )
    elif positive:
        suggested_seller_response = (
            f"Shop cảm ơn bạn đã đánh giá tích cực về {positive}. "
            "Shop sẽ tiếp tục duy trì chất lượng phục vụ trong các đơn tiếp theo."
        )
    else:
        suggested_seller_response = (
            "Shop cảm ơn bạn đã để lại phản hồi. Shop sẽ tiếp tục theo dõi để hỗ trợ khi cần."
        )

    return {
        "customer_insight": customer_insight,
        "root_cause": root_cause,
        "business_recommendation": business_recommendation,
        "suggested_seller_response": suggested_seller_response,
        "source": "template",
    }


# ---------------------------------------------------------------------------
# Full postprocess pipeline
# ---------------------------------------------------------------------------

def apply_postprocess(result: dict[str, Any], text: str) -> None:
    """Run the full postprocessing pipeline on a prediction result."""
    apply_hierarchy_correction(result)
    attach_rule_evidence(result, text)
    remove_unfounded_special_aspects(result)
    sync_macro_labels_to_aspects(result)
    derive_overall_from_aspects(result)
    add_comment_flags(result)
    result["insight"] = build_template_insight(result)


# ---------------------------------------------------------------------------
# Build final result from model logits
# ---------------------------------------------------------------------------

def build_result(
    raw_text: str,
    text: str,
    aspect_logits: dict[str, np.ndarray],
    sentiment_logits: dict[str, np.ndarray],
    aspect_model: ModelBundle,
    sentiment_model: ModelBundle,
    row_index: int,
    domain_overrides: list[dict[str, Any]] | None = None,
    source_meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a complete ABSA result from raw model logits."""
    aspect_labels = aspect_model.label_config
    sentiment_labels = sentiment_model.label_config

    macro_scores = sigmoid(aspect_logits["macro"][[row_index]])[0]
    micro_scores = sigmoid(aspect_logits["micro"][[row_index]])[0]
    overall_probs = softmax(aspect_logits["overall"][[row_index]])[0]
    micro_sentiment_scores = sigmoid(sentiment_logits["micro_sentiment"][[row_index]])[0]

    macro_indices = np.where(macro_scores >= aspect_model.macro_thresholds)[0].tolist()
    micro_indices = np.where(micro_scores >= aspect_model.micro_thresholds)[0].tolist()
    overall_idx = int(overall_probs.argmax())

    macros = [
        {
            "label": aspect_labels["macros"][idx],
            "score": round_float(macro_scores[idx]),
            "threshold": round_float(aspect_model.macro_thresholds[idx]),
        }
        for idx in macro_indices
    ]
    micros = [
        {
            "label": aspect_labels["micros"][idx],
            "score": round_float(micro_scores[idx]),
            "threshold": round_float(aspect_model.micro_thresholds[idx]),
        }
        for idx in micro_indices
    ]

    aspect_sentiments = []
    for idx in micro_indices:
        micro = aspect_labels["micros"][idx]
        picked = pick_sentiment(
            micro,
            micro_sentiment_scores,
            sentiment_model.micro_sentiment_thresholds,
            sentiment_labels["micro_sentiments"],
            sentiment_labels["sentiments"],
        )
        aspect_sentiments.append({
            "macro": MICRO_TO_MACRO.get(micro),
            "micro": micro,
            "sentiment": picked["sentiment"],
            "aspect_score": round_float(micro_scores[idx]),
            "aspect_threshold": round_float(aspect_model.micro_thresholds[idx]),
            "sentiment_score": picked["sentiment_score"],
            "sentiment_threshold": picked["sentiment_threshold"],
            "sentiment_passed_threshold": picked["sentiment_passed_threshold"],
        })

    result = {
        "text": raw_text,
        "normalized_text": text,
        "overall_sentiment": {
            "label": aspect_labels["overalls"][overall_idx],
            "score": round_float(overall_probs[overall_idx]),
        },
        "macros": macros,
        "micros": micros,
        "aspect_sentiments": aspect_sentiments,
    }
    if source_meta:
        result["meta"] = source_meta
    apply_domain_overrides(result, domain_overrides or [])
    apply_postprocess(result, raw_text)
    return result
