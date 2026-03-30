import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express, Router } from "express";
import path from "path";

const options = {
    definition: {
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                apiKey: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                    description: "API Key for authentication (Default: pk_7K9mN2pQ4rS6tU8vW0xY1zA3bC5dE7fG9hJ1kL3mN5oP)",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
                apiKey: [],
            },
        ],
        openapi: "3.0.0",
        info: {
            title: "Project Management API",
            version: "1.0.0",
            description: `
# Project Management System API

## Authentication

This API requires two types of authentication:

1. **Bearer Token (JWT)**: For user authentication
2. **API Key**: For application authentication

### Default API Key for Testing
\`\`\`
pk_7K9mN2pQ4rS6tU8vW0xY1zA3bC5dE7fG9hJ1kL3mN5oP
\`\`\`

Click the "Authorize" button and paste the API key above.

### How to use:
1. Click "Authorize" button (top right)
2. Enter API Key in the "apiKey" field
3. Enter Bearer Token in the "bearerAuth" field (if you have one)
4. Click "Authorize"
5. Try the endpoints!
            `,
        },
        servers: [
            {
                url: "/api/v1",
                description: "API version 1.0.0",
            },
            {
                url: "http://localhost:3000/api/v1",
                description: "Local development server",
            },
        ],
    },
    apis: [
        path.join(process.cwd(), "src/api/v1/modules/**/*.ts").replace(/\\/g, "/"),
        path.join(process.cwd(), "src/api/v1/routes/*.ts").replace(/\\/g, "/"),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    const router = Router();

    const customSwaggerJs = `
        window.addEventListener('load', function() {
            const waitForUi = setInterval(function() {
                if (!window.ui) return;
                clearInterval(waitForUi);

                const STORAGE_KEY = 'swagger_tokens';

                function saveTokens(accessToken, refreshToken) {
                    try {
                        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                        if (accessToken) current.accessToken = accessToken;
                        if (refreshToken) current.refreshToken = refreshToken;
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
                    } catch(e) {}
                }

                function getTokens() {
                    try {
                        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                    } catch(e) { return {}; }
                }

                function applyAccessToken(accessToken) {
                    window.ui.authActions.authorize({
                        bearerAuth: {
                            name: 'bearerAuth',
                            schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                            value: accessToken,
                        }
                    });
                }

                // Restore token from localStorage on page load
                const saved = getTokens();
                if (saved.accessToken) {
                    applyAccessToken(saved.accessToken);
                    console.log('[Swagger] Restored access token from localStorage');
                }

                const configs = window.ui.getConfigs();
                const originalResponseInterceptor = configs.responseInterceptor;

                // Request interceptor: auto-fill body for refresh-token endpoint
                configs.requestInterceptor = function(request) {
                    try {
                        if (request.url && request.url.includes('/auth/refresh-token')) {
                            const tokens = getTokens();
                            if (tokens.accessToken && tokens.refreshToken) {
                                const body = JSON.parse(request.body || '{}');
                                if (!body.accessToken) body.accessToken = tokens.accessToken;
                                if (!body.refreshToken) body.refreshToken = tokens.refreshToken;
                                request.body = JSON.stringify(body);
                                console.log('[Swagger] Auto-filled refresh-token body');
                            }
                        }
                    } catch(e) {}
                    return request;
                };

                // Response interceptor: auto-inject tokens from auth responses
                configs.responseInterceptor = function(response) {
                    try {
                        const url = response.url || '';
                        const isLogin = url.includes('/auth/login') || url.includes('/auth/verify-register');
                        const isRefresh = url.includes('/auth/refresh-token');

                        if ((isLogin || isRefresh) && response.status === 200 && response.body && response.body.data) {
                            const { accessToken, refreshToken } = response.body.data;
                            if (accessToken) {
                                applyAccessToken(accessToken);
                                saveTokens(accessToken, isLogin ? refreshToken : getTokens().refreshToken);
                                if (isRefresh && refreshToken) saveTokens(accessToken, refreshToken);
                                console.log('[Swagger] Token auto-injected from ' + (isRefresh ? 'refresh' : 'login/verify'));
                            }
                        }
                    } catch(e) {}
                    return originalResponseInterceptor ? originalResponseInterceptor(response) : response;
                };
            }, 200);
        });
    `;

    // Swagger UI options
    const swaggerUiOptions = {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info .title { color: #3b82f6; }
            .swagger-ui .info .description {
                background: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }
            .swagger-ui .info .description p,
            .swagger-ui .info .description li,
            .swagger-ui .info .description h1,
            .swagger-ui .info .description h2,
            .swagger-ui .info .description h3,
            .swagger-ui .info .description strong {
                color: #1e293b !important;
            }
            .swagger-ui .info .description code {
                background: #1e293b;
                color: #e2e8f0;
                padding: 8px 12px;
                border-radius: 4px;
                display: block;
                font-size: 13px;
            }
        `,
        customSiteTitle: "Project Management API Docs",
        customfavIcon: "/assets/favicon.ico",
        customJs: "/docs/custom.js",
    };
    
    // Explicit redirects for Swagger UI assets to CDN to fix 404 on Vercel
    // MUST be before swaggerUi.serve to intercept the requests
    const SWAGGER_UI_CDN = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0";
    router.get("/swagger-ui.css", (req, res) => res.redirect(`${SWAGGER_UI_CDN}/swagger-ui.min.css`));
    router.get("/swagger-ui-bundle.js", (req, res) => res.redirect(`${SWAGGER_UI_CDN}/swagger-ui-bundle.js`));
    router.get("/swagger-ui-standalone-preset.js", (req, res) => res.redirect(`${SWAGGER_UI_CDN}/swagger-ui-standalone-preset.js`));
    
    router.get("/custom.js", (req, res) => {
        res.setHeader("Content-Type", "application/javascript");
        res.send(customSwaggerJs);
    });

    router.use(swaggerUi.serve);
    router.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
    app.use("/docs", router);
};
