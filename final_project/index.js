const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware with proper configuration
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware for protected routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists and has authorization
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken;
        
        // Verify JWT token
        jwt.verify(token, "access", (err, decoded) => {
            if (!err) {
                // Token is valid, proceed to the next middleware/route handler
                req.user = decoded;
                next();
            } else {
                // Token is invalid
                return res.status(403).json({ 
                    message: "User not authenticated. Invalid token." 
                });
            }
        });
    } else {
        // No session or no authorization
        return res.status(403).json({ 
            message: "User not logged in. Please login first." 
        });
    }
});

// Optional: Also support Bearer token authentication
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, "access", (err, decoded) => {
            if (!err) {
                req.user = decoded;
                next();
            } else {
                return res.status(403).json({ 
                    message: "Invalid token" 
                });
            }
        });
    } else {
        // Fallback to session-based authentication
        if (req.session && req.session.authorization) {
            const token = req.session.authorization.accessToken;
            
            jwt.verify(token, "access", (err, decoded) => {
                if (!err) {
                    req.user = decoded;
                    next();
                } else {
                    return res.status(403).json({ 
                        message: "User not authenticated" 
                    });
                }
            });
        } else {
            return res.status(401).json({ 
                message: "No token provided. Please login." 
            });
        }
    }
});

const PORT = 5000;

// Mount routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Something went wrong!",
        error: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});