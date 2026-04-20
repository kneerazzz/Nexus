import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:4000']

app.use(cors({
    origin: function (origin, callback) {
        if(!origin) return callback(null, true);

        if(allowedOrigins.includes(origin)){
            callback(null, true)
        }
        else{
            callback(new Error("Not allowed by cors"))
        }
    },
    credentials: true
}))

app.use(express.json({
    limit: '16kb'
}))

app.use(express.static('public'))

app.use(express.urlencoded({
    limit: '16kb'
}))

app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("<h1>Welcome to Nexus Server</h1>");
});

app.get("/api/ping", (req, res) => {
    res.json({message: "Nexus is alive!"})
});

import userRouter from "./routes/user.routes.js"
import documentRouter from "./routes/document.routes.js"
import imageRouter from "./routes/image.routes.js"
import tagRouter from "./routes/tag.routes.js"


app.use("/api/users", userRouter);
app.use("/api/documents", documentRouter)
app.use("/api/images", imageRouter)
app.use("/api/tags", tagRouter)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message    = err.message    || "Internal server error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});
export default app;