import express from "express";
import { env } from "./infrastructure/configs/env";
import { setupSwagger } from "./infrastructure/configs/swagger";
import { helmetConfig, crossOriginConfig } from "./infrastructure/configs/helmet";
import { corsConfig } from "./infrastructure/configs/cors";
import { morganConfig } from "./infrastructure/configs/morgan";
import { bodyParserJson, bodyParserUrlEncoded } from "./infrastructure/configs/bodyParser";

// ROUTE IMPORTS


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
setupSwagger(app);

// ROUTES
app.get("/", (req, res) => {
    res.send("API version 1.0.0 for Project Management System");
});

// SERVICE
const port = env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
