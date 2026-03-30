const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Management API",
            version: "1.0.0",
            description: "# Project Management API Documentation",
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
                    description: "API Key for authentication",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
                apiKey: [],
            },
        ],
    },
    apis: [
        path.join(process.cwd(), "src/api/v1/modules/**/*.ts").replace(/\\/g, "/"),
        path.join(process.cwd(), "src/api/v1/routes/*.ts").replace(/\\/g, "/"),
    ],
};

const spec = swaggerJsdoc(options);
fs.writeFileSync(
    path.join(process.cwd(), "swagger-output.json"),
    JSON.stringify(spec, null, 2)
);
console.log("Swagger spec generated successfully to swagger-output.json");
console.log("Found routes:", spec.paths ? Object.keys(spec.paths).length : 0);
