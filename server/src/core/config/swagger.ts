import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express, Router } from "express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Project Management API",
            version: "1.0.0",
        },
    },
    apis: ["./src/api/v1/modules/**/*.ts", "./src/api/v1/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    const router = Router();
    router.use(swaggerUi.serve);
    router.get("/", swaggerUi.setup(swaggerSpec));
    app.use("/docs", router);
};
