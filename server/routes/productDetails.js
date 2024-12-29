const express = require('express');
const router = express.Router();
const mssql = require('mssql');

// Route to get all products
router.get('/fetchproducts', async (req, res) => {
    try {
        // Query to fetch products
        const result = await mssql.query('SELECT * FROM product');
        res.json(result.recordset); // Send the products as a response
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving products');
    }
});

// Route to add a new product
router.post('/addproduct', async (req, res) => {
    const { productUrl, productDescription, productImageUrl } = req.body;

    if (!productUrl || !productDescription || !productImageUrl) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Use parameterized queries to prevent SQL injection
        const query = `
            INSERT INTO product (productUrl, productDescription, productImageUrl)
            VALUES (@productUrl, @productDescription, @productImageUrl)
        `;
        const request = new mssql.Request();
        request.input('productUrl', mssql.NVarChar, productUrl);
        request.input('productDescription', mssql.NVarChar, productDescription);
        request.input('productImageUrl', mssql.NVarChar, productImageUrl);
        await request.query(query);

        res.status(201).send('Product added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding product');
    }
});

// Export the router to use in server.js
module.exports = router;
