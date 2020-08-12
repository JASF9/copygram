var User = require('../models/user');
var Tag = require('../models/tag');
var Poste = require('../models/poste');
var Message = require('../models/message');
var Follow = require('../models/follow');
var Comment = require('../models/comment');
var post_controller = require('../controllers/postController');
var sessionData;

//var session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { body, sanitizeBody,validationResult } = require('express-validator');

var async = require('async');

exports.index = function(req, res) {

    res.render('index',{title: 'Home Page'})

};

exports.user_search = function(req, res, next){
    var word = req.body.word
    User.find( { '_id' : { '$regex' : word, '$options' : 'i' } })
    .sort([['nickname', 'ascending']])
    .exec(function(err, list_user){
        if(err) {return next(err);}

        res.render('user_list',{title: 'User Search Result', user_list: list_user});
    });
}

exports.user_detail = function(req, res, next){
    
    async.parallel({
        user: function(callback){
            User.findById(req.params.id)
            .exec(callback)
        },
        user_posts: function(callback){
            Poste.find({'nickname':req.params.id, 'hide': false})
            .exec(callback);
        },
    }, function(err,results){
        if(err) {return next(err);}
        if(results.user==null){
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        var master = false;
        if(req.session.user!=null){
            if(req.session.user._id==req.params.id){
                master=true;
            }
        }
        if(master==true)
            res.render('user_detail_user',{title: results.user.nickname, user: results.user, user_posts: results.user_posts});
        else
            res.render('user_detail',{title: results.user.nickname, user: results.user, user_posts: results.user_posts});
    })
};

exports.user_create_get = function(req, res){
    res.render('user_form',{title: 'Register User'});
}

exports.user_create_post = [
    body('firstname').isLength({min:1}).trim().withMessage('First name cannot be empty.')
      .isAlphanumeric().withMessage('Special characters detected.'),
    body('lastname').isLength({min:1}).trim().withMessage('Last name cannot be empty.')
      .isAlphanumeric().withMessage('Special characters detected.'),
    body('nickname').isLength({min:1}).trim().withMessage('Nickname cannot be empty.')
      .custom(value =>{
          return User.findById(value).then(user => {
              if(user){
                  return Promise.reject('Nickname already in use');
              }
          })
      }),
    body('password').isLength({min:1,max:20}).trim().withMessage('Invalid password length.'),
    body('email').isLength({min:1}).trim().withMessage('Email cannot be empty.')
      .isEmail().withMessage('Unvalid email address.'),
    body('description').isLength({max:400}).trim().withMessage('Exceeded max allowed description length.'),
   
    sanitizeBody('firstname').escape(),
    sanitizeBody('lastname').escape(),
    sanitizeBody('nickname').escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('email').normalizeEmail(),
    sanitizeBody('description').escape(),
    sanitizeBody('private').toBoolean(),

    (req,res,next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render('user_form',{title: 'Register User', user: req.body, errors: errors.array() });
            
        }
        else{
            var hashp;
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                if(err){return next(err);}
                
                    hashp=hash;
                
            });
            var user = new User(
                {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    _id: req.body.nickname,
                    password: req.body.password,
                    email: req.body.email,
                    description: req.body.description,
                    private: req.body.private,
                    social: [],
                    likes: 0,
                    following: 0
                });
            user.save(function(err){
                if(err) {return next(err);}

                res.redirect('../login');
            });
        }
    }
];

exports.user_delete_get = function(req, res){
    res.send('ni: user delete get');
}

exports.user_delete_post = function(req, res, next){
    if(req.session.user!=null){
    async.parallel({
        user: function(callback) {
          User.findById(req.params.id).exec(callback)
        },
        user_posts: function(callback) {
          Poste.find({ 'nickname': req.params.id }).exec(callback)
        },
        user_comments: function(callback) {
          Comment.find({ 'user': req.params.id }).exec(callback)
          },
        user_follows: function(callback) {
          Follow.find({ 'user': req.params.id }).exec(callback)
        },
        user_followed: function(callback) {
            Follow.find({ 'follower': req.params.id }).exec(callback)
          },
        user_tags: function(callback) {
            Tag.find({ 'user': req.params.id }).exec(callback)
        },
        user_messages: function(callback) {
            Message.find({ 'user': req.params.id}).exec(callback)
          },
    }, function(err, results) {
        if (err) { return next(err); }
        
        if(!results.user_messages.isEmpty()){
            results.user_messages.forEach(message => {
                Message.findByIdAndDelete(message._id)
            });
        }

        if(!results.user_tags.isEmpty()){
            results.user_tags.forEach(tags => {
                Tag.findByIdAndDelete(tags._id)
            });
        }

        if(!results.user_followed.isEmpty()){
            results.user_followed.forEach( follow => {
                Follow.findByIdAndDelete(follow._id)
            });
        }

        if(!results.user_follows.isEmpty()){
            results.user_follows.forEach( follow => {
                Follow.findByIdAndDelete(follow._id)
            });
        }

        if(!results.user_comments.isEmpty()){
            results.user_comments.forEach( comment => {
                Comment.findByIdAndDelete(comment._id)
            });
        }

        post_controller.delete_posts(results.user_posts);

        User.findByIdAndDelete(user._id);

        res.redirect('../')
    });
    }
    else{
        res.render('expired');
    }
}

exports.user_update_get = function(req, res,next){
    if(req.session.user!=null){
    User.findById(req.session.user._id)
    .exec(function(err, list_user){
        if(err) {return next(err);}

        res.render('user_form',{title: 'Update User', user: list_user});
    });
    }
    else{
        res.render('expired')
    }
}

exports.user_update_post = [
    body('firstname').isLength({min:1}).trim().withMessage('First name cannot be empty.')
      .isAlphanumeric().withMessage('Special characters detected.'),
    body('lastname').isLength({min:1}).trim().withMessage('Last name cannot be empty.')
      .isAlphanumeric().withMessage('Special characters detected.'),
    body('nickname').isLength({min:1}).trim().withMessage('Nickname cannot be empty.')
      .custom(value =>{
          return User.findById(value).then(user => {
              if(user){
                  return Promise.reject('Nickname already in use');
              }
          })
      }),
    body('password').isLength({min:1,max:20}).trim().withMessage('Invalid password length.'),
    body('email').isLength({min:1}).trim().withMessage('Email cannot be empty.')
      .isEmail().withMessage('Unvalid email address.'),
    body('description').isLength({max:400}).trim().withMessage('Exceeded max allowed description length.'),
    

    sanitizeBody('firstname').escape(),
    sanitizeBody('lastname').escape(),
    sanitizeBody('nickname').escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('email').normalizeEmail(),
    sanitizeBody('description').escape(),
    sanitizeBody('private').toBoolean(),

    (req,res,next) => {

        if(req.session.user!=null){
        const errors = validationResult(req);

        var hashp;
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                if(err){return next(err);}
                if(hash){
                    hashp=hash;
                }
            });
            var user = new User(
                {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    _id: req.body.nickname,
                    password: req.body.password,
                    email: req.body.email,
                    description: req.body.description,
                    private: req.body.private,
                    //social: [],
                    likes: req.body.likes,
                    following: req.body.following,
                });

        if(!errors.isEmpty()) {
            res.render('user_form',{title: 'Update User', user: req.body, errors: errors.array() });
            
        }
        else{
            
            User.findByIdAndUpdate(req.params.id, user, {}, function (err,theuser) {
                if (err) { return next(err); }
                   
                   res.redirect(theuser.url);
                });
        }
        }
        else{
            res.render('expired')
        }
    }
];
exports.user_login_get = function(req, res){
    res.render('login_page',{title:'Login'});
}

exports.user_login_post = [
    body('nickname').isLength({min:1}).trim().withMessage('Empty nickname field detected.'),
    body('password').isLength({min:1}).trim().withMessage('Empty password field detected.'),

    sanitizeBody('nickname').escape(),
    sanitizeBody('password').escape(),

    (req,res,next) =>{

        var errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render('login_page',{title: 'Login', user: req.body, errors: errors.array() });
        }
        else{
            User.findById(req.body.nickname)
            .exec(function (err,u){
                if(err) {return next(err)}
                if(u==null){
                    res.render('login_page',{title: 'Login', user:req.body, errors: errors.array()});
                }
                else{
                    //bcrypt.compare(req.body.password, u.password, function(err, result) {
                        //if(result==true){
                            //sessionData = req.session;
                            req.session.user ={};
                            req.session.user._id = req.body.nickname;
                            //req.session = sessionData;
                            req.session.save();
                            console.log(req.session.user._id)
                            res.redirect(u.url);
                        //}
                        //else{
                            //res.render('login_page',{title: 'Login', user:req.body, errors: errors.array()});
                        //}
                    //});
                }
            })
            
        }
    }
]

exports.user_like = function(nickname){
    
    User.find( { '_id': nickname })
    .exec(function(err, user){
        if(err) {return next(err);}

        var a = user.likes;
        a = a+1;

        var userup = new User(
            {
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id,
                password: userr.password,
                email: user.email,
                description: user.description,
                private: user.private,
                //social: [],
                likes: a,
                following: user.following,
            });
        User.findByIdAndUpdate(user._id,userup);

    });
}

exports.user_like_delete = function(nickname){
    
    User.find( { '_id': nickname })
    .exec(function(err, user){
        if(err) {return next(err);}

        var a = user.likes;
        a = a-1;

        var userup = new User(
            {
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id,
                password: userr.password,
                email: user.email,
                description: user.description,
                private: user.private,
                //social: [],
                likes: a,
                following: user.following,
            });
        User.findByIdAndUpdate(user._id,userup);

    });
}

exports.user_follow = function(nickname){
    
    User.find( { '_id': nickname })
    .exec(function(err, user){
        if(err) {return next(err);}

        var a = user.following;
        a = a+1;

        var userup = new User(
            {
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id,
                password: userr.password,
                email: user.email,
                description: user.description,
                private: user.private,
                //social: [],
                likes: user.likes,
                following: a,
            });
        User.findByIdAndUpdate(user._id,userup);

    });
}

exports.user_follow_delete = function(nickname){
    
    User.find( { '_id': nickname })
    .exec(function(err, user){
        if(err) {return next(err);}

        var a = user.following;
        a = a-1;

        var userup = new User(
            {
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id,
                password: userr.password,
                email: user.email,
                description: user.description,
                private: user.private,
                //social: [],
                likes: user.likes,
                following: a,
            });
        User.findByIdAndUpdate(user._id,userup);

    });
}

    