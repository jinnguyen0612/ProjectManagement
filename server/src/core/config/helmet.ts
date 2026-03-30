import helmet from "helmet";

export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            workerSrc: ["'self'", "blob:"],
        },
    },
});

export const crossOriginConfig = helmet.crossOriginResourcePolicy({ policy: "cross-origin" });
