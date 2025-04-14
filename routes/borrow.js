const express = require('express');
const bookModel = require('../models').Books;
const categoryModel = require('../models').Categories;
const borrowModel = require('../models').Borrow;
const userModel = require('../models').Users;
const JwtMiddleware = require('../config/jwt-middleware');
const { Op } = require('sequelize');
const router = express.Router();

router.post('/borrow', JwtMiddleware.checkToken, (req, res) => {
    const user_id = req.user.id;
    const book_id = req.body.book_id;
    const borrowed_at = req.body.borrowed_at;

    borrowModel.findAll({
        where: {
            user_id: user_id,
            returned_date: { [Op.is]: null }
        }
    }).then((books) => {
        if (books.length < 5) {
            bookModel.findOne({ where: { id: book_id, is_available: true } }).then(book => {
                if (!book) {
                    res.status(400).json({
                        status: 0,
                        message: "Book is not available for borrowing"
                    });
                }
                borrowModel.create({
                    user_id: user_id,
                    book_id: book_id,
                    borrowed_at: borrowed_at
                }).then(() => {
                    book.update({ is_available: false }).then(() => {
                        res.status(200).json({
                            status: 1,
                            message: "Book borrowed successfully"
                        });
                    });
                });
            }).catch(err => {
                res.status(500).json({
                    status: 0,
                    message: "Error borrowing book",
                    error: err
                });
            });
        } else {
            res.status(400).json({
                status: 0,
                message: "You can borrow up to 5 books only"
            });
        }
    });
});

router.post('/return', JwtMiddleware.checkToken, (req, res) => {
    const user_id = req.user.id;
    const book_id = req.body.book_id;
    const returned_date = req.body.returned_date;
    console.log("return_date", returned_date);

    borrowModel.findOne({
        where: {
            user_id: user_id,
            book_id: book_id,
            returned_date: { [Op.is]: null }
        }
    }).then(borrow => {
        if (borrow) {
            borrow.update({
                returned_date: returned_date
            }).then(() => {
                bookModel.update({
                    is_available: true
                },
                    {
                        where: { id: book_id }
                    }).then(() => {
                        res.status(200).json({
                            status: 1,
                            message: "Book returned successfully"
                        });
                    });
            });
        } else {
            res.status(400).json({
                status: 0,
                message: "No active borrowing found for this book"
            });
        }
    }).catch(err => {
        res.status(500).json({ status: 0, message: "Error returning book", error: err });
    });
});

router.get('/userhistory', JwtMiddleware.checkToken , (req, res) => {
    const user_id = req.query.user_id;

    borrowModel.findAll({
        where: { user_id: user_id },
        include: [
            {
                model: userModel,
                as: 'user',
                attributes: ['id', 'username']
            },
            {
                model: bookModel,
                as: 'book',
                attributes: ['id', 'title', 'author', 'published_date']
            }
        ]
    }).then((history) => {
        if(history){
            res.status(200).json({
                status: 1,
                data: history
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "history not found"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            status: 0,
            message: "Error searching history",
            error: error
        });
    });
});

router.get('/bookstatus', JwtMiddleware.checkToken , (req, res) => {
    const id = req.query.id;

    bookModel.findAll({
        where: { id: id },
        include: [
            {
                model: categoryModel,
                as: 'category',
                attributes: ['id', 'name']
            }
        ],
        attributes: ['id', 'title', 'author', 'published_date', 'is_available']
    }).then((book) => {
        if(book){
            res.status(200).json({
                status: 1,
                data: book
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "book not found"
            });
        }
    }).catch((error) => {
        res.status(500).json({
            status: 0,
            message: "Error searching book",
            error: error
        });
    });
});

module.exports = router;