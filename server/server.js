const express = require('express');
const mssql = require('mssql');
const fs = require('fs');
const cors = require('cors');
const productRoutes = require('./routes/productDetails'); // Import routes for products

// Read and parse db.json
const dbConfig = JSON.parse(fs.readFileSync('db.json', 'utf-8'));

// Create an instance of Express
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Middleware to handle CORS
app.use(cors({
    origin: '*', // Allow all origins (Adjust to specific domains as needed)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Set up database connection pool for SQL Server Authentication
const sqlConfig = {
    server: dbConfig.DB_SERVER, // Your SQL Server instance name
    database: dbConfig.DB_NAME, // Your database name
    options: {
        encrypt: dbConfig.encrypt,               // Use encryption for secure connection
        trustServerCertificate: dbConfig.trustServerCertificate // Required for local development
    },
    authentication: {
        type: 'default',              // Use SQL Server Authentication
        options: {
            userName: dbConfig.DB_USER,  // SQL Server username
            password: dbConfig.DB_PASSWORD // SQL Server password
        }
    }
};

// Connect to the database
async function connectToDatabase() {
    try {
        await mssql.connect(sqlConfig);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);  // Exit the application on DB connection failure
    }
}

// Call the function to connect to the database
connectToDatabase();

// Root route to check if the server is running
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Import and use the product-related routes under '/api'
app.use('/api', productRoutes);

// Catch-all route for undefined paths
app.all('*', (req, res) => {
    res.status(404).send('Route not found');
});

// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
