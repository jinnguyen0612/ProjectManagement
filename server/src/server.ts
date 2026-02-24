import app from "./app";
import { env } from "./core/config/env";

const port = env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
