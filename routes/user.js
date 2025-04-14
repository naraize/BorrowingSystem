const express = require('express');
const userModel = require('../models').Users;
const JWT = require('jsonwebtoken');
const JwtConfic = require('../config/jwt-config');
const JwtMiddleware = require('../config/jwt-middleware');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/users',JwtMiddleware.checkToken, (req, res) => {

    userModel.findAll().then((data) => {
        if(data){
            res.status(200).json({
                status: 1,
                message: "User Found",
                data: data
            });
        }else{
            res.status(200).json({
                status: 0,
                message: "No User"
            });
        }
    })
    
});

router.post('/register',(req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = bcrypt.hashSync(req.body.password, 10)
    
    userModel.findOne({
        where:{
            username: username
        }
    }).then((user)=>{
        if(user){
            res.status(200).json({
                status: 0,
                message: "User already exists"
            })
        }else{
            userModel.create({
                email: email,
                username: username,                
                password: password
            }).then((response) => {
                res.status(200).json({
                    status: 1,
                    message: "User has been registered successfully"
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
    })
});

router.post('/login',(req, res)=>{
    userModel.findOne({
        where:{
            username: req.body.username
        }
    }).then((user)=>{
        if(user){
            if(bcrypt.compareSync(req.body.password, user.password)){
                let userToken = JWT.sign({
                    username: user.username,
                    id: user.id
                },JwtConfic.secret,{
                    expiresIn: JwtConfic.expiresIn,
                    notBefore: JwtConfic.notBefore,
                    audience: JwtConfic.audience
                });

                res.status(200).json({
                    status: 1,
                    message: "User Logined Successfully",
                    token: userToken
                })
            }else{
                res.status(500).json({
                    status: 0,
                    message: "Password didn't match"
                })
            }
        }else{
            res.status(500).json({
                status: 0,
                message: "User not exists with this username"
            });
        }
    }).catch((error)=>{
        console.log(error);        
    })
})

router.put('/editprofile', JwtMiddleware.checkToken, (req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = bcrypt.hashSync(req.body.password, 10)

    userModel.findOne({
        where:{
            id: req.user.id
        }
    }).then((user)=>{
        if(user){
            userModel.update({
                email: email,
                username: username,                
                password: password
            },
        {
            where: { id: req.user.id }
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
        }else{            
            res.status(200).json({
                status: 0,
                message: "User already exists"
            })
        }
    }).catch((error)=>{
        console.log(error);        
    })
});

router.delete("/deleteuser/:id", function(req, res){
    let id = req.params.id;
    userModel.findOne({
        where:{
            id: id
        }
    }).then((user)=>{
        if(user){
            userModel.destroy({
                where:{
                    id: req.params.id
                }
            }).then(data => {
                res.status(200).json({
                    status:1,
                    message: "User has been delete successfully",
                });
            }).catch(error => {
                res.status(500).json({
                    status:0,
                    message: "Fail to delete user",
                    data: error
                });        
            });
        }else{            
            res.status(200).json({
                status: 0,
                message: "User not Found"
            })
        }
    }).catch((error)=>{
        console.log(error);        
    })
});


module.exports = router;