const express = require('express');
const bookModel = require('../models').Books;
const categoryModel = require('../models').Categories;
const JwtMiddleware = require('../config/jwt-middleware');
const { Op } = require('sequelize');
const router = express.Router();

router.get('/books', JwtMiddleware.checkToken , (req, res) => {

    bookModel.findAll({
        include: [{ 
            model: categoryModel, 
            as: 'category' 
        }]
    }).then((data) => {
        if(data){
            res.status(200).json({
                status: 1,
                message: "Book Found",
                data: data
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "No Book"
            });
        }
    })    
});

router.post('/addbook', JwtMiddleware.checkToken ,(req, res) => {
    let title = req.body.title;
    let author = req.body.author;
    let published_date = req.body.published_date;
    let category_id = req.body.category_id;
    
    bookModel.findOne({
        where:{
            title: title
        }
    }).then((book)=>{
        if(book){
            res.status(200).json({
                status: 0,
                message: "Title already exists"
            })
        }else{            
            categoryModel.findOne({
                where: {
                    id: category_id
                }
            }).then((category) => {
                if(category){
                    bookModel.create({
                        title: title,
                        author: author,                
                        published_date: published_date,
                        category_id: category_id
                    }).then((response) => {
                        res.status(200).json({
                            status: 1,
                            message: "Book has been add successfully"
                        });
                    }).catch((error) => {
                        res.status(500).json({
                            status: 0,
                            data: error
                        })
                    })
                }else{
                    res.status(500).json({
                        status: 0,
                        message: "Invalid category ID"
                    });
                }
            }).catch((error)=>{
                console.log(error);        
            });
        }
    }).catch((error)=>{
        console.log(error);        
    });
});

router.put('/updatebook/:id', JwtMiddleware.checkToken, (req, res) => {
    let id = req.params.id;
    let title = req.body.title;
    let author = req.body.author;
    let published_date = req.body.published_date;
    let category_id = req.body.category_id;

    bookModel.findOne({
        where: {
            id: id
        }
    }).then((book) => {
        if (book) {
            categoryModel.findOne({
                where: {
                    id: category_id
                }
            }).then((category) => {
                if (category) {
                    bookModel.update({
                        title: title,
                        author: author,
                        published_date: published_date,
                        category_id: category_id
                    },
                        {
                            where: { id: id }
                        }).then((response) => {
                            res.status(200).json({
                                status: 1,
                                message: "User has been update successfully"
                            });
                        }).catch((error) => {
                            res.status(500).json({
                                status: 0,
                                data: error
                            })
                        })
                } else {
                    res.status(500).json({
                        status: 0,
                        message: "Invalid category ID"
                    });
                }
            }).catch((error) => {
                console.log(error);
            });
        } else {
            res.status(200).json({
                status: 0,
                message: "Book not found"
            })
        }
    }).catch((error) => {
        console.log(error);
    })
});

router.get('/searchbook', JwtMiddleware.checkToken , (req, res) => {
    const { author, published_date, category_name } = req.query;
    let condition = {};

    if (author) {
        condition.author = { [Op.like]: `%${author}%` };
    }

    if (published_date) {
        condition.published_date = published_date;
    }

    let categoryCondition = {};
    if (category_name) {
        categoryCondition.name = { [Op.like]: `%${category_name}%` };
    }

    bookModel.findAll({
        where: condition,
        include: [
            {
                model: categoryModel,
                where: categoryCondition,
                as: 'category',
                attributes: ['id', 'name']
            }
        ]
    }).then((books) => {
        if(books){
            res.status(200).json({
                status: 1,
                data: books
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "Book not found"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            status: 0,
            message: "Error searching books",
            error: error
        });
    });
});



router.delete("/deletebook/:id", JwtMiddleware.checkToken , function(req, res){
    let id = req.params.id;
    bookModel.findOne({
        where:{
            id: id
        }
    }).then((book)=>{
        if(book){
            bookModel.destroy({
                where:{
                    id: req.params.id
                }
            }).then(data => {
                res.status(200).json({
                    status:1,
                    message: "Book has been delete successfully",
                });
            }).catch(error => {
                res.status(500).json({
                    status:0,
                    message: "Fail to delete Book",
                    data: error
                });        
            });
        }else{            
            res.status(200).json({
                status: 0,
                message: "Book not Found"
            })
        }
    }).catch((error)=>{
        console.log(error);        
    })
});


module.exports = router;