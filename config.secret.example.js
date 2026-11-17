// TEMPLATE - Sao chép thành config.secret.js rồi điền thông tin thật
// File config.secret.js đã được gitignore, an toàn khi push lên git
var CFG_SECRET = {
  PIN: "XXXXXX",                        // 6 chữ số PIN
  PIN_HINT: "Gợi ý cho PIN...",
  TEN: "Tên em",                        // Tên người nhận
  CAU_HOI: "Câu hỏi tỏ tình...",       // Câu hỏi ở màn hình S4
  LOI_NHAN: [                           // Các dòng lời nhắn ở S6
    "Dòng 1...",
    "Dòng 2...",
  ],
  LOI_CUOI: "Lời kết...",              // Lời kết ở S7
  NGAY_BAT_DAU: "YYYY-MM-DD",          // Ngày bắt đầu tính số ngày yêu
  EMAILJS_SERVICE_ID:  "service_...",  // Từ emailjs.com > Email Services
  EMAILJS_TEMPLATE_ID: "template_...", // Từ emailjs.com > Email Templates
  EMAILJS_PUBLIC_KEY:  "...",          // Từ emailjs.com > Account > API Keys
  EMAIL_TO: "you@gmail.com"            // Email nhận lá thư
};
