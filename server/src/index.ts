import express from "express";
import { env } from "./infrastructure/configs/env";
import { setupSwagger } from "./infrastructure/configs/swagger";
import { helmetConfig, crossOriginConfig } from "./infrastructure/configs/helmet";
import { corsConfig } from "./infrastructure/configs/cors";
import { morganConfig } from "./infrastructure/configs/morgan";
import { bodyParserJson, bodyParserUrlEncoded } from "./infrastructure/configs/bodyParser";
import { globalLimiter } from "./infrastructure/configs/rateLimiter";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

// IMPORT ROUTES
import authRoutes from "./modules/auth/auth.route";
import uploadRoutes from "./modules/upload/upload.route";

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
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// SERVICE
const port = env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
