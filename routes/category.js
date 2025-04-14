const express = require('express');
const bookModel = require('../models').Books;
const categoryModel = require('../models').Categories;
const JwtMiddleware = require('../config/jwt-middleware');
const { Op } = require('sequelize');
const router = express.Router();

router.get('/categories', JwtMiddleware.checkToken , (req, res) => {

    categoryModel.findAll({}).then((data) => {
        if(data){
            res.status(200).json({
                status: 1,
                message: "CategoryModel Found",
                data: data
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "No CategoryModel"
            });
        }
    })    
});

router.post('/addcategory', JwtMiddleware.checkToken ,(req, res) => {
    let name = req.body.name;
    let description = req.body.description;
    
    categoryModel.findOne({
        where:{
            name: name
        }
    }).then((book)=>{
        if(book){
            res.status(200).json({
                status: 0,
                message: "Name already exists"
            })
        }else{            
            categoryModel.create({
                name: name,
                description: description
            }).then((response) => {
                res.status(200).json({
                    status: 1,
                    message: "Category has been add successfully"
                });
            }).catch((error) => {
                res.status(500).json({
                    status: 0,
                    data: error
                })
            })
        }
    }).catch((error)=>{
        console.log(error);        
    });
});

router.put('/updatecategory/:id', JwtMiddleware.checkToken, (req, res) => {
    let id = req.params.id;
    let name = req.body.name;
    let description = req.body.description;

    categoryModel.findOne({
        where: {
            id: id
        }
    }).then((category) => {
        if (category) {
            categoryModel.update({
                name: name,
                description: description
            },
                {
                    where: { id: id }
                }).then((response) => {
                    res.status(200).json({
                        status: 1,
                        message: "Category has been update successfully"
                    });
                }).catch((error) => {
                    res.status(500).json({
                        status: 0,
                        data: error
                    })
                })
        } else {
            res.status(200).json({
                status: 0,
                message: "Category not found"
            })
        }
    }).catch((error) => {
        console.log(error);
    })
});



router.delete("/deletecategory/:id", JwtMiddleware.checkToken , function(req, res){
    let id = req.params.id;
    categoryModel.findOne({
        where:{
            id: id
        }
    }).then((user)=>{
        if(user){
            categoryModel.destroy({
                where:{
                    id: req.params.id
                }
            }).then(data => {
                res.status(200).json({
                    status:1,
                    message: "Category has been delete successfully",
                });
            }).catch(error => {
                res.status(500).json({
                    status:0,
                    message: "Fail to delete Category",
                    data: error
                });        
            });
        }else{            
            res.status(200).json({
                status: 0,
                message: "Category not Found"
            })
        }
    }).catch((error)=>{
        console.log(error);        
    })
});


module.exports = router;