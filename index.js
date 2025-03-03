const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
// Define the port number
const port = 8000;

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors());

// Initialize an empty array to store users
let users = [];

// Initialize a variable to store the MySQL connection
let conn = null;

// Function to initialize MySQL connection
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 8821
    });
};

// Route to get all users
app.get('/users', async (req, res) => {
    const results = await conn.query('SELECT * FROM users');
    res.json(results[0]);
});

// Route to create a new user
app.post('/users', async (req, res) => {
    try {
        let user = req.body;
        const results = await conn.query('INSERT INTO users SET ?', user);
        res.json({
            message: 'Create user successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('error: ', error.message);
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        });
    }
});

// Route to get a user by ID
app.get('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('SELECT * FROM users WHERE id = ?', id)
        if (results[0].length > 0) {
            res.json(results[0][0])
        } else {
            throw {status: 404, message: 'User not found'}
        }
        res.json(results[0][0])
   
    }catch(error){
        console.error('error: ', error.message)
        let statusCode = error.statusCode || 500
        res.status(500).json({
            message: 'something went wrong',
            errorMessage: error.message
        })
    }
})

// Route to update a user by ID
app.put('/users/:id', async (req, res) => {
    let id = req.params.id;
    let updateUser = req.body;
    try {
        let user = req.body;
        const [result] = await conn.query(
            'UPDATE users SET ? WHERE id = ?', 
            [updateUser, id]);
        res.json({
            message: 'Update user successfully',
            data: result[0]
        });
     } catch (error) {
         console.error("Error: ", error.message);
         res.status(500).json({ 
             message: "something went wrong",
             errorMassage: error.message
         });
     }
});
//path: DELETE /users/:id สำหรับลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
app.delete('/users/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE from users WHERE id = ?', id)    
        res.json({
            message: 'Delete user successfully',
            data: results[0]
        })
    } catch (error) {
        console.log('error', error.message)
        res.status(500).json({
            message: 'Something went wrong',
            errorMessage: error.message
        })
    }
    
})

app.listen(port, async (req, res) => {
    await initMySQL()
    console.log('Http Server is running on port' + port)
});