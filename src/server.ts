import app from "./app";
import { PORT } from "./config/config.ts";
const SERVERPORT = PORT || 3000;
app.listen(SERVERPORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
