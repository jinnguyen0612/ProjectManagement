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

// Rate limit nghiêm ngặt cho auth (login, register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit: 10,                // tối đa 10 requests / 15 phút / IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts, please try again after 15 minutes",
    },
});
