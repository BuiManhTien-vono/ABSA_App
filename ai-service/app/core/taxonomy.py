"""Taxonomy constants for HIGEN-ABSA hierarchical aspect system."""

from __future__ import annotations

# Mapping from micro aspect to macro aspect parent
MICRO_TO_MACRO: dict[str, str] = {
    "Appearance_Design": "PRODUCT",
    "Material_BuildQuality": "PRODUCT",
    "Performance_Functionality": "PRODUCT",
    "Usability_Experience": "PRODUCT",
    "Authenticity_Packaging": "PRODUCT",
    "Delivery_Speed": "SHIPPING",
    "External_Packaging": "SHIPPING",
    "Courier_Attitude": "SHIPPING",
    "Shipping_Fee": "SHIPPING",
    "Response_Time": "SERVICE",
    "Consulting_Attitude": "SERVICE",
    "AfterSales_Complaint": "SERVICE",
    "Price_Promotion": "PRICE",
    "Price_Performance_Ratio": "PRICE",
    "Overall_Sentiment": "OTHERS",
    "Spam_Noise": "OTHERS",
    "Intent_QA": "OTHERS",
}

MACRO_ASPECTS = ["PRODUCT", "SHIPPING", "SERVICE", "PRICE", "OTHERS"]

MICRO_ASPECTS = list(MICRO_TO_MACRO.keys())

SENTIMENTS = ["POS", "NEG", "NEU"]

OVERALL_SENTIMENTS = ["POS", "NEG", "NEU", "MIXED"]

# Vietnamese descriptive text for each micro aspect
MICRO_TEXT: dict[str, str] = {
    "Appearance_Design": "hình thức/mẫu mã sản phẩm",
    "Material_BuildQuality": "chất liệu hoặc độ hoàn thiện sản phẩm",
    "Performance_Functionality": "hiệu năng hoặc tình trạng hoạt động",
    "Usability_Experience": "trải nghiệm sử dụng",
    "Authenticity_Packaging": "tính chính hãng, bao bì hoặc mô tả sản phẩm",
    "Delivery_Speed": "tốc độ giao hàng",
    "External_Packaging": "đóng gói vận chuyển",
    "Courier_Attitude": "thái độ nhân viên giao hàng",
    "Shipping_Fee": "phí vận chuyển",
    "Response_Time": "tốc độ phản hồi của shop",
    "Consulting_Attitude": "thái độ tư vấn/hỗ trợ của shop",
    "AfterSales_Complaint": "xử lý đổi trả, bảo hành hoặc khiếu nại",
    "Price_Promotion": "giá bán hoặc khuyến mãi",
    "Price_Performance_Ratio": "mức độ đáng tiền",
    "Overall_Sentiment": "cảm xúc chung",
    "Spam_Noise": "nội dung spam hoặc nhiễu",
    "Intent_QA": "ý định hỏi đáp/mua hàng",
}

# Business recommendations for each micro aspect
MICRO_RECOMMENDATIONS: dict[str, str] = {
    "Appearance_Design": "kiểm tra mẫu mã, màu sắc và hình ảnh mô tả trước khi giao",
    "Material_BuildQuality": "rà soát chất liệu, đường may và khâu kiểm tra chất lượng",
    "Performance_Functionality": "kiểm tra chức năng sản phẩm trước khi đóng gói",
    "Usability_Experience": "bổ sung hướng dẫn sử dụng và làm rõ sản phẩm phù hợp với nhu cầu nào",
    "Authenticity_Packaging": "làm rõ thông tin chính hãng, tem nhãn, bao bì và mô tả sản phẩm",
    "Delivery_Speed": "theo dõi SLA vận chuyển và phối hợp đơn vị giao hàng để giảm chậm trễ",
    "External_Packaging": "gia cố quy trình đóng gói để hạn chế móp méo, rách vỡ",
    "Courier_Attitude": "phản ánh với đơn vị vận chuyển về thái độ giao hàng",
    "Shipping_Fee": "tối ưu phí ship, freeship hoặc mã vận chuyển khi có thể",
    "Response_Time": "rút ngắn thời gian phản hồi tin nhắn của shop",
    "Consulting_Attitude": "duy trì thái độ tư vấn lịch sự, nhiệt tình và nhất quán",
    "AfterSales_Complaint": "chuẩn hóa quy trình đổi trả, bảo hành và xử lý khiếu nại",
    "Price_Promotion": "kiểm tra mức giá, voucher và thông tin khuyến mãi",
    "Price_Performance_Ratio": "cân đối chất lượng thực tế với giá bán và kỳ vọng khách hàng",
}

# Micros that are ignored in insight generation
INSIGHT_IGNORED_MICROS = {"Spam_Noise", "Intent_QA"}
