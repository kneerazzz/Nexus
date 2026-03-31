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

export default app;