import helmet from "helmet";

export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            workerSrc: ["'self'", "blob:"],
        },
    },
});

export const crossOriginConfig = helmet.crossOriginResourcePolicy({ policy: "cross-origin" });
