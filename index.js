import app from "./app.js";
import { config } from "./src/config/index.js"

app.listen(config.port, () => {
	console.log(`server is running on http://localhost:${config.port}`);
})