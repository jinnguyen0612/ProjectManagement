import rateLimit from "express-rate-limit";

// Rate limit chung cho tất cả API
export const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    limit: 50,               // tối đa 50 requests / 1 phút / IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});

// Rate limit nghiêm ngặt cho login (chỉ tính lần sai)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit: 5,                 // tối đa 5 lần sai / 15 phút / IP
    skipSuccessfulRequests: true, // Nếu login thành công thì không tính vào giới hạn này
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many failed login attempts, please try again after 15 minutes",
    },
});

// Rate limit nghiêm ngặt cho OTP (resend OTP)
export const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    limit: 1,                // tối đa 1 request / 1 phút / IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "You can only request an OTP once per minute. Please wait before trying again.",
    },
});
