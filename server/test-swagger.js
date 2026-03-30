const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.0" },
    },
    apis: [
        path.join(process.cwd(), "src/api/v1/modules/**/*.ts").replace(/\\/g, "/"),
        path.join(process.cwd(), "src/api/v1/routes/*.ts").replace(/\\/g, "/"),
    ],
};

const spec = swaggerJsdoc(options);
console.log("Found routes:", spec.paths ? Object.keys(spec.paths).length : 0);
console.log("Spec paths keys:", spec.paths ? Object.keys(spec.paths) : "none");
