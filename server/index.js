const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials');

const app = express();
const db = process.env.DATABASE_URI;
const PORT = process.env.PORT || 4000;

// Connection à la base de données
connectDB(db);

// Vérifie si l'adresse à l'origine de la requête est comprise dans les adresses autorisées
app.use(credentials);

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Initialisation de Socket.io
var http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const sockets = require('./socket');
sockets(io);

// Middleware anonyme pour afficher quelques données sur la requête (utile pour le debug)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Mise en place des différentes routes
// - Auth
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
// - Api
app.use('/api/game', require('./routes/api/game'));
app.use('/api/user', require('./routes/api/users'));


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
