const express = require('express');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const borrowRoutes = require('./routes/borrow');
const categoryRoutes = require('./routes/category');
const bodyParser = require('body-parser');
const PORT = 8087;
const app = express();
app.use(bodyParser.json());
app.use('/', userRoutes);
app.use('/', bookRoutes);
app.use('/', borrowRoutes);
app.use('/', categoryRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 1,
        message: "Welcome"
    });
});

app.listen(PORT, () => {
    console.log("App is rinning AS PORT "+PORT);    
});