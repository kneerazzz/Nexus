import app from "./app.js";
import { connectDB } from "./config/db.js";
import { PORT } from "./config/env.js";

const port = PORT || 4000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log("Nexus server is running on port " + port);
        console.log(`http://localhost:${port}`);
    })
}).catch((err) => {
    console.log("Error connecting to database" + err.message);
})


