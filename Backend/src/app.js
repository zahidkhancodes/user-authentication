const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userModel = require('./models/user.model');

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // Allow any origin for testing
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


/*
POST /register  => Register a new user
POST /login     => Login user, set JWT cookie
POST /logout    => Clear JWT cookie
GET  /me        => Check if user is logged in (protected)
*/


// Middleware to protect routes
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Not logged in" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
}


app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await userModel.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Registered successfully" });
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,        // must be true for cross-domain sameSite: 'none'
        sameSite: 'none',    // supports cross-origin requests (e.g. frontend on localhost/github pages, backend on Render)
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
    });

    res.status(200).json({ message: "Logged in successfully", email: user.email });
});


app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.status(200).json({ message: "Logged out successfully" });
});


app.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({ message: "Authenticated", email: req.user.email });
});


module.exports = app;
