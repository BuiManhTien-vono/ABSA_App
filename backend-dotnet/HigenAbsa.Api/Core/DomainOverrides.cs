// Core/DomainOverrides.cs - Port of postprocess.py domain override rules
using System.Text.RegularExpressions;

namespace HigenAbsa.Api.Core;

/// <summary>One domain override rule: (micro, sentiment, pattern, reason_prefix).</summary>
public record DomainOverrideRule(string Micro, string Sentiment, Regex Pattern, string ReasonPrefix);

/// <summary>A detected override from regex matching.</summary>
public class OverrideEntry
{
    public string Macro { get; set; } = "";
    public string Micro { get; set; } = "";
    public string Sentiment { get; set; } = "";
    public string Reason { get; set; } = "";
    public string? OverallHint { get; set; }
    public string? Evidence { get; set; }
    public int? EvidenceStart { get; set; }
    public int? EvidenceEnd { get; set; }
}

public static class DomainOverrides
{
    // -----------------------------------------------------------------------
    // Authenticity patterns
    // -----------------------------------------------------------------------

    private static readonly (Regex Pattern, string Cue)[] AuthNegPatterns =
    [
        (new Regex(@"\bseal\s+bị\s+bóc(?:\s+sẵn)?|\bseal\s+bi\s+boc(?:\s+san)?", RegexOptions.IgnoreCase | RegexOptions.Compiled), "seal bị bóc"),
        (new Regex(@"\bkhông\s+có\s+tem(?:\s+phụ)?|\bkhong\s+co\s+tem(?:\s+phu)?", RegexOptions.IgnoreCase | RegexOptions.Compiled), "không có tem"),
        (new Regex(@"\bh[aà]ng\s+nh[aá]i\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hàng nhái"),
        (new Regex(@"\bh[aà]ng\s+gi[aả]\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hàng giả"),
        (new Regex(@"\bfake\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "fake"),
        (new Regex(@"kh[oô]ng\s+(?:ph[aả]i\s+)?ch[ií]nh\s+h[aã]ng", RegexOptions.IgnoreCase | RegexOptions.Compiled), "không chính hãng"),
        (new Regex(@"k(?:o|h[oô]ng)?\s+ch[ií]nh\s+h[aã]ng", RegexOptions.IgnoreCase | RegexOptions.Compiled), "không chính hãng"),
        (new Regex(@"gi[aả]\s+m[aạ]o", RegexOptions.IgnoreCase | RegexOptions.Compiled), "giả mạo"),
    ];

    private static readonly Regex[] AuthNegExclusions =
    [
        new(@"kh[oô]ng\s+ph[aả]i\s+h[aà]ng\s+nh[aá]i", RegexOptions.IgnoreCase | RegexOptions.Compiled),
        new(@"kh[oô]ng\s+ph[aả]i\s+h[aà]ng\s+gi[aả]", RegexOptions.IgnoreCase | RegexOptions.Compiled),
        new(@"kh[oô]ng\s+fake", RegexOptions.IgnoreCase | RegexOptions.Compiled),
    ];

    private static readonly (Regex Pattern, string Cue)[] AuthPosPatterns =
    [
        (new Regex(@"\bmã\s+qr\s+check\s+ra\s+đúng\s+hãng|\bma\s+qr\s+check\s+ra\s+dung\s+hang", RegexOptions.IgnoreCase | RegexOptions.Compiled), "mã QR check ra đúng hãng"),
        (new Regex(@"\bseal\s+còn\s+nguyên|\bseal\s+con\s+nguyen", RegexOptions.IgnoreCase | RegexOptions.Compiled), "seal còn nguyên"),
        (new Regex(@"\bch[ií]nh\s+h[aã]ng\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "chính hãng"),
        (new Regex(@"\bh[aà]ng\s+th[aậ]t\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hàng thật"),
        (new Regex(@"\bauth(?:entic)?\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "authentic"),
    ];

    private static readonly Regex PositiveCuePattern = new(
        @"\b(t[oố]t|[dđ][eẹ]p|[oô]n|ok|ưng|th[ií]ch|nhanh|ch[aắ]c\s+ch[aắ]n|xịn)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex ContrastPattern = new(
        @"\b(nhưng|nhg|tuy\s+nhi[eê]n|m[aà])\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // -----------------------------------------------------------------------
    // General domain override rules (micro, sentiment, regex, reason)
    // -----------------------------------------------------------------------

    public static readonly IReadOnlyList<DomainOverrideRule> Rules = new List<DomainOverrideRule>
    {
        new("Overall_Sentiment", "NEG", new Regex(@"\b(?:không\s+hài\s+lòng|khong\s+hai\s+long|hơi\s+thất\s+vọng|hoi\s+that\s+vong|thất\s+vọng|that\s+vong|trừ\s+1đ|tru\s+1d|1\s+sao\s+cho|không\s+thèm\s+ngó|khong\s+them\s+ngo|hơi\s+hối\s+hận|hoi\s+hoi\s+han|hối\s+hận|hoi\s+han)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_overall_negative_cue"),
        new("Overall_Sentiment", "NEU", new Regex(@"\b(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|mua\s+về\s+chưa\s+dùng|mua\s+ve\s+chua\s+dung)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_overall_neutral_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"\b(?:ok\s+dùng\s+cũng\s+được|ok\s+dung\s+cung\s+duoc|(?:rất|rat|quá|qua)\s+(?:ok|okay|oke|ổn|on)|nói\s+chung\s+ok|noi\s+chung\s+ok|mọi\s+mặt\s+ok|moi\s+mat\s+ok|chất\s+lượng\s+tốt|chat\s+luong\s+tot|hàng\s+tốt|hang\s+tot|đáng\s+để\s+mua|dang\s+de\s+mua|vẫn\s+cho\s+shop\s+5\s+sao|van\s+cho\s+shop\s+5\s+sao|cho\s+shop\s+5\s*sao|10\s*đỉm|10\s*điểm|10\s*diem|sẽ\s+ủng\s+hộ|se\s+ung\s+ho|mẹ\s+thích\s+lắm|me\s+thich\s+lam|nhẹ\s*,\s*gọn\s*,\s*xinh|nhe\s*,\s*gon\s*,\s*xinh|nồi\s+đẹp|noi\s+dep|máy\s+đẹp|may\s+dep|mẫu\s+mã\s+đẹp|mau\s+ma\s+dep|hình\s+thức\s+đẹp|hinh\s+thuc\s+dep)\b|(?<!không\s)(?<!khong\s)\b(?:rất\s+)?hài\s+lòng\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_overall_positive_cue"),
        new("Performance_Functionality", "NEU", new Regex(@"\b(?:chưa\s+dùng\s+thử|chua\s+dung\s+thu|chưa\s+sử\s+dụng|chua\s+su\s+dung|chưa\s+xài|chua\s+xai|mua\s+về\s+chưa\s+dùng|mua\s+ve\s+chua\s+dung)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_performance_pending_cue"),
        new("Performance_Functionality", "NEG", new Regex(@"\b(?:không\s+ngon(?:\s+lắm)?|khong\s+ngon(?:\s+lam)?|ko\s+ngon|k\s+ngon|không\s+giòn|khong\s+gion|không\s+béo|khong\s+beo|không\s+thơm|khong\s+thom|ít\s+kem|it\s+kem|phần\s+nhựa\s+gia\s+công\s+chưa\s+kỹ|phan\s+nhua\s+gia\s+cong\s+chua\s+ky|viền\s+đế\s+khá\s+bén|vien\s+de\s+kha\s+ben|không\s+tách\s+rời\s+được|khong\s+tach\s+roi\s+duoc|không\s+dựng\s+đứng\s+được|khong\s+dung\s+dung\s+duoc|lỗi\s+nhỏ|loi\s+nho)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_performance_negative_cue"),
        new("Performance_Functionality", "POS", new Regex(@"\b(?:rất\s+ngon|rat\s+ngon|sữa\s+ngon|sua\s+ngon|bia\s+ngon|bánh\s+ngon|banh\s+ngon|trà\s+thơm|tra\s+thom|cafe\s+thơm|cà\s+phê\s+thơm|ca\s+phe\s+thom|hàng\s+mới\s*,\s*thơm|hang\s+moi\s*,\s*thom|thơm\s+lắm|thom\s+lam|thơm\s*,\s*ngọt|thom\s*,\s*ngot|uống\s+thơm|uong\s+thom|thơm\s+mạnh|thom\s+manh|uống\s+chơi\s+khá\s+hợp|uong\s+choi\s+kha\s+hop|không\s+chát\s+lắm|khong\s+chat\s+lam|gạo\s+nấu\s+lên\s+rất\s+thơm|gao\s+nau\s+len\s+rat\s+thom|dẻo\s+vừa\s+ăn|deo\s+vua\s+an|ngọt\s+thơm\s+tự\s+nhiên|ngot\s+thom\s+tu\s+nhien|bã\s+khô|ba\s+kho|chạy\s+êm|chay\s+em|quạt\s+chạy\s+êm|quat\s+chay\s+em|quạt\s+rất\s+mát|quat\s+rat\s+mat|mát\s+với\s+nhu\s+cầu|mat\s+voi\s+nhu\s+cau|máy\s+tập\s+tốt|may\s+tap\s+tot|hút\s+mạnh|hut\s+manh|hút\s+khỏe|hut\s+khoe|hút\s+sạch|hut\s+sach|giòn\s+rụm|gion\s+rum|đậm\s+vị|dam\s+vi|uống\s+cũng\s+ngon|uong\s+cung\s+ngon|uống\s+cũng\s+được|uong\s+cung\s+duoc|uống\s+rất\s+ok|uong\s+rat\s+ok|hoạt\s+động\s+đúng\s+chức\s+năng|hoat\s+dong\s+dung\s+chuc\s+nang|hoạt\s+động\s+tố\b|hoat\s+dong\s+to\b|máy\s+đánh\s+tơi|may\s+danh\s+toi)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_performance_positive_cue"),
        new("Appearance_Design", "NEG", new Regex(@"\b(?:không\s+giống\s+hình(?:\s+chụp)?|khong\s+giong\s+hinh(?:\s+chup)?|không\s+giống\s+ảnh|khong\s+giong\s+anh|không\s+giống\s+nhau|khong\s+giong\s+nhau|khác\s+hình|khac\s+hinh|khác\s+ảnh|khac\s+anh)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_appearance_negative_cue"),
        new("Appearance_Design", "POS", new Regex(@"\b(?:cute|dễ\s+thương|de\s+thuong|đẹp\s+mắt|dep\s+mat|bao\s+bì\s+hạt\s+dễ\s+thương|bao\s+bi\s+hat\s+de\s+thuong|hạt\s+gạo\s+thon\s+dài|hat\s+gao\s+thon\s+dai)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_appearance_positive_cue"),
        new("Material_BuildQuality", "NEG", new Regex(@"\b(?:bị\s+nứt|bi\s+nut|bị\s+móp|bi\s+mop|bị\s+phồng|bi\s+phong|bị\s+xì|bi\s+xi|hư\s+như\s+vậy|hu\s+nhu\s+vay|gia\s+công\s+chưa\s+kỹ|gia\s+cong\s+chua\s+ky|khá\s+bén|kha\s+ben)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_material_negative_cue"),
        new("External_Packaging", "POS", new Regex(@"\b(?:đóng\s+gói|dong\s+goi|gói\s+hàng|goi\s+hang|bao\s+bì|bao\s+bi)(?:\s+\w+){0,4}\s+(?:kỹ|kĩ|ky|cẩn\s+thận|can\s+than|đẹp|dep|chắc\s+chắn|chac\s+chan|nguyên\s+vẹn|nguyen\s+ven)\b|\b(?:túi|tui|hộp|hop|thùng|thung|hàng|hang)(?:\s+\w+){0,3}\s+(?:nguyên\s+vẹn|nguyen\s+ven|ép\s+chân\s+không|ep\s+chan\s+khong)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_packaging_positive_cue"),
        new("External_Packaging", "NEG", new Regex(@"\b(?:bị\s+móp(?:\s+\w+){0,4}\s+thùng|bi\s+mop(?:\s+\w+){0,4}\s+thung|thùng(?:\s+\w+){0,4}\s+bị\s+móp|thung(?:\s+\w+){0,4}\s+bi\s+mop|vỏ\s+thùng(?:\s+\w+){0,4}\s+ướt|vo\s+thung(?:\s+\w+){0,4}\s+uot|gói\s+hơi\s+ẩu|goi\s+hoi\s+au|gói\s+ẩu|goi\s+au|bụi\s+bám|bui\s+bam)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_packaging_negative_cue"),
        new("Price_Promotion", "POS", new Regex(@"\b(?:mua\s+sale|mua\s+flash\s+sale|săn\s+sale\s+được|san\s+sale\s+duoc|giá\s+mềm|gia\s+mem|sale\s+được|sale\s+duoc|free\s+tikinow|tikinow\s+free|giá\s+siêu\s+hời|gia\s+sieu\s+hoi|voucher\s+\d+k|tặng\s+voucher|tang\s+voucher|đang\s+giảm\s+giá|dang\s+giam\s+gia|thêm\s+mã\s+giảm\s+giá|them\s+ma\s+giam\s+gia|mã\s+giảm\s+giá|ma\s+giam\s+gia)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_price_promotion_positive_cue"),
        new("Price_Promotion", "NEG", new Regex(@"\b(?:khuyến\s+mãi\s+ghi\s+cho\s+có|khuyen\s+mai\s+ghi\s+cho\s+co|voucher\s+không\s+dùng\s+được|voucher\s+khong\s+dung\s+duoc|mã\s+giảm\s+giá\s+không\s+dùng\s+được|ma\s+giam\s+gia\s+khong\s+dung\s+duoc)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hardcase_price_promotion_negative_cue"),
        new("Intent_QA", "NEU", new Regex(@"\b(?:shop\s+ơi|shop\s+oi|shop\s+à|shop\s+a|xin\s+hỏi|xin\s+hoi|đổi\s+được\s+không|doi\s+duoc\s+khong|được\s+không\s+ạ|duoc\s+khong\s+a|không\s+shop|khong\s+shop|làm\s+thế\s+nào|lam\s+the\s+nao|ntn|có\s+bền\s+không|co\s+ben\s+khong)\b|\?!?", RegexOptions.IgnoreCase | RegexOptions.Compiled), "real_intent_qa_cue"),
        new("Performance_Functionality", "NEU", new Regex(@"\b(?:dùng\s+cũng\s+được|dung\s+cung\s+duoc)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hardcase_performance_neutral_cue"),
        new("Delivery_Speed", "NEU", new Regex(@"\b(?:thời\s+gian\s+giao\s+như\s+dự\s+kiến|thoi\s+gian\s+giao\s+nhu\s+du\s+kien)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hardcase_delivery_neutral_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"(?:^|[.!?,;]\s*|\b(?:còn|với\s+lại|nhưng|mà|con|voi\s+lai|nhung|ma)\s+)(?:ok|okay|oke|tốt|tot|ổn|on)(?:\s*(?:nha|nhé|nhe|ạ|a|nè|ne))?(?=$|[\s,.;!?])|\b(?<!không\s)(?<!khong\s)(?<!ko\s)(?<!k\s)(?:rất\s+|rat\s+|quá\s+|qua\s+|khá\s+|kha\s+|cũng\s+|cung\s+|vẫn\s+|van\s+|đều\s+|deu\s+|thì\s+|thi\s+)?(?:ok|okay|oke|ổn|on)(?:\s*(?:nha|nhé|nhe|ạ|a|nè|ne|luôn|luon|lắm|lam))?(?!\s+không)(?=$|[\s,.;!?])|\b(?:dùng|dung|xài|xai|sài|sai|chạy|chay|sử\s+dụng|su\s+dung)(?:\s+\w+){0,4}\s+(?:ok|okay|oke|ổn|on|tốt|tot)\b|\b(?:đáng\s+mua|dang\s+mua|so\s+ok|5\s*sao|cho\s+shop\s+điểm\s+5|cho\s+shop\s+diem\s+5|sẽ\s+ủng\s+hộ|se\s+ung\s+ho|nên\s+mua|nen\s+mua|10\s*/\s*10)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "hardcase_clause_overall_positive_cue"),
        new("Spam_Noise", "NEU", new Regex(@"\b(?:nhận\s+xu|lấy\s+xu|đủ\s+ký\s+tự)\b|\.{4,}|(?:a{4,}|k{4,})", RegexOptions.IgnoreCase | RegexOptions.Compiled), "spam_noise_cue"),
        new("Overall_Sentiment", "NEG", new Regex(@"\b(?:không|khong|ko|k)\s+(?:ổn|on|ok|oke|được|duoc|ưng|ung)\b|\b(?:tệ|te|chán|chan|fail)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:(?:không|khong|ko|k)\s+(?:ổn|on|ok|oke|được|duoc|ưng|ung)|(?:tệ|te|chán|chan|fail|lỗi|loi|hỏng|hong))\s*(?:[.!…]+)?\s*$", RegexOptions.IgnoreCase | RegexOptions.Compiled), "short_overall_negative_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"\b(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+(?:ok|oke|okela|okla|ổn|on|được|duoc|tốt|tot|ưng|ung|đều|deu)\b|\b(?:okela|okla|oke|ưng|ung|ổn\s+nha|on\s+nha|được\s+nha|duoc\s+nha)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:ok|oke|okela|okla|ổn|on|được|duoc|tốt|tot|ưng|ung|đều|deu)\s*(?:nha|nhé|nhe|ạ|a|luôn|lun|lắm|lam|quá|qua)?\s*(?:[.!…]+)?\s*$", RegexOptions.IgnoreCase | RegexOptions.Compiled), "short_overall_positive_cue"),
        new("Overall_Sentiment", "NEU", new Regex(@"\b(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|bt|bth|cũng\s+được|cung\s+duoc|chưa\s+dùng|chua\s+dung|đã\s+nhận|da\s+nhan|nhận\s+hàng\s+rồi|nhan\s+hang\s+roi)\b|^\s*(?:(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+)?(?:tạm\s+ổn|tam\s+on|tạm\s+được|tam\s+duoc|bình\s+thường|binh\s+thuong|bt|bth|cũng\s+được|cung\s+duoc|chưa\s+dùng|chua\s+dung|đã\s+nhận|da\s+nhan|nhận\s+hàng\s+rồi|nhan\s+hang\s+roi)\s*(?:[.!…]+)?\s*$", RegexOptions.IgnoreCase | RegexOptions.Compiled), "short_overall_neutral_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"\b(?:rất\s+thích|rat\s+thich|tương\s+đối\s+ổn|tuong\s+doi\s+on|khá\s+ổn|kha\s+on|ưng\s+ý|ung\s+y|hài\s+lòng|hai\s+long|okela|không\s+có\s+gì\s+để\s+chê|khong\s+co\s+gi\s+de\s+che)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "overall_positive_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"\bkhông\s+hề\s+thất\s+vọng\b|\b(?:khong\s+he\s+that\s+vong)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "overall_positive_negation_cue"),
        new("Overall_Sentiment", "NEG", new Regex(@"\b(?:không|ko|k)\s+mua\s+(?:lại|nữa)\b|\b(?:khong|ko|k)\s+mua\s+(?:lai|nua)\b|\bthat\s+vong\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "overall_negative_cue"),
        new("Overall_Sentiment", "POS", new Regex(@"\b(?:sẽ|se)\s+mua\s+(?:lại|lai)\b|\bokela\b|\bnhận\s+hàng\s+khá\s+ổn\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "overall_positive_cue"),
        new("Delivery_Speed", "POS", new Regex(@"\b(?:nhận\s+hàng|nhan\s+hang)(?:\s+\w+){0,3}\s+(?:nhanh|sớm|som)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "delivery_speed_positive_cue"),
        new("Delivery_Speed", "NEG", new Regex(@"\b(?:giao|ship|vận\s+chuyển|van\s+chuyen)(?:\s+hàng|\s+hang)?(?:\s+\w+){0,2}\s+(?:không\s+nhanh|khong\s+nhanh|lâu|lau|chậm|cham|trễ|tre)\b|\bchờ(?:\s+\w+){0,3}\s+lâu\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "delivery_speed_negative_cue"),
        new("Delivery_Speed", "POS", new Regex(@"\b(?:giao|ship|van\s+chuyen)(?:\s+hang)?(?:\s+\w+){0,2}\s+(?:nhanh|dung\s+hen|som)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "delivery_speed_positive_cue"),
        new("Performance_Functionality", "NEG", new Regex(@"\b(?:sp|sản\s+phẩm|san\s+pham|hàng|hang)(?:\s+(?:này|nay))?\s+(?:lỗi|loi|hỏng|hong)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "short_product_broken_cue"),
        new("Appearance_Design", "POS", new Regex(@"\b(?:đẹp|xinh|sang|mẫu\s+mã\s+đẹp|màu\s+đẹp|form\s+đẹp|thiết\s+kế\s+đẹp)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "appearance_positive_cue"),
        new("Appearance_Design", "NEG", new Regex(@"\b(?:xấu|móp\s+méo|trầy|xước|bể|vỡ|nứt|màu\s+xấu|sai\s+màu)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "appearance_negative_cue"),
        new("Material_BuildQuality", "POS", new Regex(@"\b(?:chất\s+liệu|chat\s+lieu|vải|vai)(?:\s+\w+){0,4}\s+(?:mềm|mem|mịn|min|tot|tốt|on|ổn|dày|day)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "material_positive_cue"),
        new("Material_BuildQuality", "NEG", new Regex(@"\bvải(?:\s+\w+){0,3}\s+(?:mỏng|xấu|kém|rách|lỗi)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "material_negative_cue"),
        new("Performance_Functionality", "POS", new Regex(@"\b(?:không|khong|ko)\s+lỗi\b|\b(?:may|máy|pin|sạc|sac|chạy|chay|dùng|dung)(?:\s+\w+){0,4}\s+(?:em|êm|trau|trâu|ben|bền|on|ổn|tot|tốt|muot|mượt)\b|\b(?:bền|ben)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "performance_positive_cue"),
        new("Performance_Functionality", "NEG", new Regex(@"\b(?:san\s+pham\s+loi|sản\s+phẩm\s+bị\s+lỗi|bị\s+lỗi|bi\s+loi|ko\s+dung\s+duoc|khong\s+dung\s+duoc|không\s+dùng\s+được|pin\s+tụt|pin\s+tut|pin\s+yếu|pin\s+yeu|sạc\s+nóng|sac\s+nong|nóng|nong|hư|hu|hỏng|hong)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "performance_negative_cue"),
        new("External_Packaging", "POS", new Regex(@"\b(?:đóng\s+gói|gói\s+hàng|bọc)(?:\s+\w+){0,3}\s+(?:kỹ|cẩn\s+thận|chắc|đẹp)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "external_packaging_positive_cue"),
        new("External_Packaging", "NEG", new Regex(@"\b(?:đóng\s+gói|gói\s+hàng|hộp|bao\s+bì)(?:\s+\w+){0,3}\s+(?:móp|méo|rách|ẩu|kém)\b|\b(?:giao\s+thiếu\s+hàng|thiếu\s+hàng)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "external_packaging_negative_cue"),
        new("Response_Time", "POS", new Regex(@"\b(?:rep|phản\s+hồi|trả\s+lời|chat|inbox)(?:\s+\w+){0,3}\s+(?:nhanh|sớm|ngay|liền)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "response_time_positive_cue"),
        new("Response_Time", "NEG", new Regex(@"\b(?:rep|phản\s+hồi|trả\s+lời|chat|inbox)(?:\s+\w+){0,3}\s+(?:chậm|lâu|trễ)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "response_time_negative_cue"),
        new("Response_Time", "NEG", new Regex(@"\bkhông\s+(?:rep|phản\s+hồi|trả\s+lời)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "response_time_negative_cue"),
        new("Consulting_Attitude", "POS", new Regex(@"\b(?:shop|nhân\s+viên|tư\s+vấn|hỗ\s+trợ|rep)(?:\s+\w+){0,3}\s+(?:nhiệt\s+tình|lịch\s+sự|dễ\s+thương|vui\s+vẻ|tốt)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "consulting_attitude_positive_cue"),
        new("Consulting_Attitude", "NEG", new Regex(@"\b(?:shop|nhân\s+viên|tư\s+vấn|hỗ\s+trợ)(?:\s+\w+){0,3}\s+(?:thái\s+độ|cọc|khó\s+chịu|tệ|kém)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "consulting_attitude_negative_cue"),
        new("Price_Promotion", "POS", new Regex(@"\b(?:giá|voucher|khuyến\s+mãi|sale)(?:\s+\w+){0,3}\s+(?:tốt|rẻ|hời|ổn)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "price_positive_cue"),
        new("Price_Promotion", "NEG", new Regex(@"\b(?:hơi\s+)?(?:mắc|đắt)\b|\b(?:giá|gia)(?:\s+\w+){0,3}\s+(?:cao|đắt|mắc)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "price_negative_cue"),
        new("Price_Performance_Ratio", "POS", new Regex(@"\b(?:đáng\s+tiền|xứng\s+đáng|đáng\s+mua|hợp\s+giá)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "price_performance_positive_cue"),
        new("Price_Performance_Ratio", "NEG", new Regex(@"\b(?:không\s+đáng|không\s+xứng|phí\s+tiền|tiền\s+nào\s+của\s+nấy)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "price_performance_negative_cue"),
        new("Shipping_Fee", "POS", new Regex(@"\b(?:freeship|free\s+ship|miễn\s+phí\s+ship|phí\s+ship\s+rẻ|ship\s+rẻ)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "shipping_fee_positive_cue"),
        new("Shipping_Fee", "NEG", new Regex(@"\b(?:phí\s+ship|tiền\s+ship|ship)(?:\s+\w+){0,3}\s+(?:cao|đắt|mắc)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "shipping_fee_negative_cue"),
        new("AfterSales_Complaint", "POS", new Regex(@"\b(?:đổi\s+trả|bảo\s+hành|hoàn\s+tiền|xử\s+lý)(?:\s+\w+){0,3}\s+(?:nhanh|tốt|ổn|dễ)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "aftersales_positive_cue"),
        new("AfterSales_Complaint", "NEG", new Regex(@"\b(?:đổi\s+trả|bảo\s+hành|hoàn\s+tiền|khiếu\s+nại|xử\s+lý)(?:\s+\w+){0,4}\s+(?:chậm|khó|tệ|không)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "aftersales_negative_cue"),
        new("Usability_Experience", "POS", new Regex(@"\b(?:mặc|mac|dùng|dung|sử\s+dụng|su\s+dung)(?:\s+\w+){0,4}\s+(?:thoải\s+mái|thoai\s+mai|dễ\s+dùng|de\s+dung|vừa\s+vặn|vua\s+van)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "usability_positive_cue"),
        new("Usability_Experience", "NEG", new Regex(@"\b(?:mặc\s+bị\s+ngứa|mac\s+bi\s+ngua|khó\s+chịu|kho\s+chiu|lắp\s+không\s+được|lap\s+khong\s+duoc|không\s+lắp\s+được|khong\s+lap\s+duoc)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "usability_negative_cue"),
        new("Intent_QA", "NEU", new Regex(@"\b(?:cho\s+hỏi|mình\s+hỏi|bao\s+giờ|ở\s+đâu|như\s+thế\s+nào)\b|\b(?:có|còn)(?:\s+\w+){1,6}\s+không\b|\?", RegexOptions.IgnoreCase | RegexOptions.Compiled), "intent_question_cue"),
        new("Performance_Functionality", "NEU", new Regex(@"\b(?:chưa\s+dùng|chưa\s+sử\s+dụng|chưa\s+test|chưa\s+đánh\s+giá)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "performance_neutral_cue"),
        new("Performance_Functionality", "NEG", new Regex(@"\b(?:hỏng|bị\s+lỗi|sản\s+phẩm\s+bị\s+lỗi|không\s+lên|không\s+chạy|không\s+dùng\s+được|không\s+hoạt\s+động|pin\s+tụt|pin\s+yếu|sạc\s+không\s+lên)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "performance_negative_cue"),
        new("Performance_Functionality", "POS", new Regex(@"\b(?:hoạt\s+động|chạy|dùng|sử\s+dụng|pin|sạc)(?:\s+\w+){0,3}\s+(?:tốt|ổn|ngon|bền|mượt)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled), "performance_positive_cue"),
    };

    // -----------------------------------------------------------------------
    // Evidence cue patterns for model-predicted aspects
    // -----------------------------------------------------------------------

    private static readonly Dictionary<string, Regex[]> EvidenceCuePatterns = new()
    {
        ["Performance_Functionality"] = [new Regex(@"\b(?:hoạt\s+động|chạy|dùng|sử\s+dụng|pin|sạc|hỏng|lỗi|không\s+dùng\s+được|không\s+hoạt\s+động)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Usability_Experience"]      = [new Regex(@"\b(?:tiện|tiện\s+lợi|dễ\s+dùng|khó\s+dùng|thoải\s+mái|bất\s+tiện|phù\s+hợp)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Authenticity_Packaging"]    = [new Regex(@"\b(?:chính\s+hãng|fake|hàng\s+giả|hàng\s+nhái|tem|seal|bao\s+bì|đúng\s+mô\s+tả|sai\s+mô\s+tả)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Courier_Attitude"]          = [new Regex(@"\b(?:shipper|người\s+giao\s+hàng|nhân\s+viên\s+giao\s+hàng)(?:\s+\w+){0,3}\s+(?:nhiệt\s+tình|lịch\s+sự|khó\s+chịu|tệ|vui\s+vẻ)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Shipping_Fee"]              = [new Regex(@"\b(?:phí\s+ship|tiền\s+ship|freeship|free\s+ship|mã\s+vận\s+chuyển|ship\s+cao|ship\s+rẻ)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Overall_Sentiment"]         = [new Regex(@"\b(?:hài\s+lòng|thất\s+vọng|ưng|tuyệt\s+vời|quá\s+tệ|không\s+hài\s+lòng|sẽ\s+mua\s+tiếp|không\s+mua\s+lại)\b", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Spam_Noise"]                = [new Regex(@"\b(?:nhận\s+xu|lấy\s+xu|đủ\s+ký\s+tự)\b|\.{4,}|(?:a{4,}|k{4,})", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
        ["Intent_QA"]                 = [new Regex(@"\b(?:cho\s+hỏi|mình\s+hỏi|bao\s+giờ|ở\s+đâu|như\s+thế\s+nào|có\s+không)\b|\?", RegexOptions.IgnoreCase | RegexOptions.Compiled)],
    };

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    private static bool HasMixedAuthContext(string text) =>
        PositiveCuePattern.IsMatch(text) && ContrastPattern.IsMatch(text);

    public static List<OverrideEntry> DetectDomainOverrides(string text)
    {
        var overrides = new List<OverrideEntry>();

        // Authenticity patterns
        bool anyExcluded = AuthNegExclusions.Any(p => p.IsMatch(text));
        if (!anyExcluded)
        {
            bool authNegFound = false;
            foreach (var (pattern, cue) in AuthNegPatterns)
            {
                var m = pattern.Match(text);
                if (!m.Success) continue;
                var (start, end, evidence) = TextUtils.ClauseSpanForMatch(text, m.Index, m.Index + m.Length);
                overrides.Add(new OverrideEntry
                {
                    Macro = "PRODUCT", Micro = "Authenticity_Packaging", Sentiment = "NEG",
                    Reason = $"authenticity_negative_cue:{cue}",
                    OverallHint = HasMixedAuthContext(text) ? "MIXED" : "NEG",
                    Evidence = evidence, EvidenceStart = start, EvidenceEnd = end,
                });
                authNegFound = true;
                break;
            }
            if (!authNegFound)
            {
                foreach (var (pattern, cue) in AuthPosPatterns)
                {
                    var m = pattern.Match(text);
                    if (!m.Success) continue;
                    var (start, end, evidence) = TextUtils.ClauseSpanForMatch(text, m.Index, m.Index + m.Length);
                    overrides.Add(new OverrideEntry
                    {
                        Macro = "PRODUCT", Micro = "Authenticity_Packaging", Sentiment = "POS",
                        Reason = $"authenticity_positive_cue:{cue}",
                        Evidence = evidence, EvidenceStart = start, EvidenceEnd = end,
                    });
                    break;
                }
            }
        }

        // General domain override rules
        foreach (var rule in Rules)
        {
            var m = rule.Pattern.Match(text);
            if (!m.Success) continue;
            var (start, end, evidence) = TextUtils.ClauseSpanForMatch(text, m.Index, m.Index + m.Length);
            var cue = m.Value.Trim();
            overrides.Add(new OverrideEntry
            {
                Macro = Taxonomy.MicroToMacro.GetValueOrDefault(rule.Micro, "OTHERS"),
                Micro = rule.Micro,
                Sentiment = rule.Sentiment,
                Reason = $"{rule.ReasonPrefix}:{cue}",
                Evidence = evidence, EvidenceStart = start, EvidenceEnd = end,
            });
        }

        return DedupeOverrides(overrides);
    }

    public static (int Start, int End, string Evidence, string Source)? FindEvidenceForMicro(string text, string micro)
    {
        foreach (var rule in Rules)
        {
            if (rule.Micro != micro) continue;
            var m = rule.Pattern.Match(text);
            if (!m.Success) continue;
            var (s, e, ev) = TextUtils.ClauseSpanForMatch(text, m.Index, m.Index + m.Length);
            return (s, e, ev, rule.ReasonPrefix);
        }
        if (EvidenceCuePatterns.TryGetValue(micro, out var patterns))
        {
            foreach (var p in patterns)
            {
                var m = p.Match(text);
                if (!m.Success) continue;
                var (s, e, ev) = TextUtils.ClauseSpanForMatch(text, m.Index, m.Index + m.Length);
                return (s, e, ev, "evidence_cue");
            }
        }
        return null;
    }

    private static List<OverrideEntry> DedupeOverrides(List<OverrideEntry> overrides)
    {
        var seen = new HashSet<(string, string, string)>();
        var result = new List<OverrideEntry>();
        foreach (var ov in overrides)
        {
            var key = (ov.Micro, ov.Sentiment, (ov.Evidence ?? "").ToLowerInvariant());
            if (!seen.Add(key)) continue;
            result.Add(ov);
        }
        return result;
    }
}
