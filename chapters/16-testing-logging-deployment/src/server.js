require("dotenv").config(); const app = require("./app");
const logger = require("./lib/logger");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`🏪 Chapter 16 running on http://localhost:${PORT}`));
