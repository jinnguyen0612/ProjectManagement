import express from "express";
import { setupSwagger } from "./core/config/swagger";
import { helmetConfig, crossOriginConfig } from "./core/config/helmet";
import { corsConfig } from "./core/config/cors";
import { morganConfig } from "./core/config/morgan";
import { bodyParserJson, bodyParserUrlEncoded } from "./core/config/bodyParser";
import { globalLimiter } from "./core/config/rateLimiter";
import { errorHandler } from "./core/errors/errorHandler";
import { notFoundHandler } from "./api/v1/middlewares/notFound.middleware";

// IMPORT ROUTES
import v1Routes from "./api/v1/routes/index";

// CONFIGURATION
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();
app.use(express.json());
app.use(helmetConfig);
app.use(crossOriginConfig);
app.use(morganConfig);
app.use(bodyParserJson);
app.use(bodyParserUrlEncoded);
app.use(corsConfig);
app.use(globalLimiter);
setupSwagger(app);

// ROUTES
app.get("/", (req, res) => {
    res.send("API version 1.0.0 for Project Management System");
});

// Versioned Routes
app.use("/api/v1", v1Routes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
