import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express, Router } from "express";

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
                url: "http://localhost:3000",
                description: "Development server",
            },
        ],
    },
    apis: ["./src/api/v1/modules/**/*.ts", "./src/api/v1/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    const router = Router();
    
    // Swagger UI options
    const swaggerUiOptions = {
        swaggerOptions: {
            persistAuthorization: true, // Lưu authorization khi refresh page
            displayRequestDuration: true, // Hiển thị thời gian request
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
        `,
        customSiteTitle: "Project Management API Docs",
    };
    
    router.use(swaggerUi.serve);
    router.get("/", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
    app.use("/docs", router);
};
