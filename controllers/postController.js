var Poste = require('../models/poste');
var User = require('../models/user');
var Tag = require('../models/tag');
var Like = require('../models/like');
var Message = require('../models/message');
var Follow = require('../models/follow');
var Comment = require('../models/comment');
var notif = require('../controllers/messageController');
//var session = require('express-session');

var sessionData;

var fileUpload = require("express-fileupload");
var session = require('express-session');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const { body, sanitizeBody,validationResult } = require('express-validator');


const { nextTick } = require('async');
//const { delete } = require('../app');

exports.index = function(req, res, next) {

    Poste.find({hide: false}, 'nickname image date')
    .populate('nickname')
    .exec(function (err, list_posts){
        if(err) {return next(err)}

        list_posts.sort(function(a,b){
            var c = new Date(a.date).getTime();
            var d = new Date(b.date).getTime();
            return c > d ? 1 : -1;
        })
        res.render('post_list', {title:'Posts', post_list: list_posts});
    });

};

exports.post_list = function(req, res, next){
    
    Poste.find({hide: false}, 'nickname image date')
    .populate('nickname')
    .exec(function (err, list_posts){
        if(err) {return next(err)}

        list_posts.sort(function(a,b){
            var c = new Date(a.date).getTime();
            var d = new Date(b.date).getTime();
            return c > d ? 1 : -1;
        })
        res.render('post_list', {title:'Posts', post_list: list_posts});
    });
};

exports.post_detail = function(req, res, next){

    async.parallel({
        poste: function(callback) {
            Poste.findById(req.params.id)
            .populate('nickname')
            .exec(callback);
        },

        post_comments: function(callback){
            Comment.find({ 'post': req.params.id })
            .exec(callback);
        },

        post_tags: function(callback){
            Tag.find({'post':req.params.id})
            .exec(callback);
        },
    }, function(err,results){
        if(err) {return next(err); }
        if(results.poste==null){ //No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        var master = false;
        var hide = false;
        if(req.session.user!=null){
            if(req.session.user._id==results.poste.nickname){
                master=true;
                req.session.post = {};
                req.session.post = results.poste;
            }
            else{
                if(results.poste.nickname.private==true){
                    Follow.find({'user':results.poste.nickname,'follower':req.session.user.nickname}).exec(function (err, result){
                        if (err) {return next(err)}
                        if (result==null){
                            hide = true;
                        }
                    })
                }
            }
        }
        else{
            if(results.post.nickname.private==true){
                hide = true
            }
        }
        if(master==true)
            res.render('post_detail_user',{ title: 'Post Detail', post_detail: results.poste, post_comments: results.post_comments, post_tags: results.post_tags});
        else
            if(hide==false)
              res.render('post_detail',{ title: 'Post Detail', post_detail: results.poste, post_comments: results.post_comments, post_tags: results.post_tags});
            else
              res.render('private_user');
    });
    
};

exports.post_create_get = function(req, res){
    res.render('post_form',{title: 'New Post'});
}

exports.post_create_post = [

    //body('nickname').isLength({min:1}).trim().withMessage('User not found'),
    //body('image').isLength({min:1}).trim().withMessage('Image is required.'),
    body('description').isLength({min:1,max:400}).trim().withMessage("Invalid description."),
    body('hide').isBoolean().withMessage('Access status error'),

    //sanitizeBody('nickname').escape(),
    //sanitizeBody('image').escape(),
    sanitizeBody('description').escape(),
    sanitizeBody('hide').toBoolean(),

    (req,res,next) => {
        if(req.session.user!=null){
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render('post_form',{title: 'New Post', poste: req.body, errors: errors.array() });
            return
        }
        else{
            const { image } = req.body.image;
            image.mv(path.resolve(_direname,'public/images',image.name),(err) =>{

                var poste = new Poste(
                    {
                
                        nickname: req.session.user._id,
                        image: `/images/${image.name}`,
                        description: req.body.description,
                        hide: req.body.hide,
                        likes: 0,
                    });
                poste.save(function(err){
                    if(err) {return next(err);}
                    notif.notification_post(req.session.user._id);
                    res.redirect(poste.url);
                });
            })
            
        }
    }
    else{
        res.render('expired')
    }
    }
    
];

exports.post_delete_get = function(req, res){
    res.send('ni: post delete get');
}

exports.post_delete_post = function(req, res){
    if(req.session.user!=null){
    delete_posts(req.params.id);
    res.redirect(req.session.user._id);
    }
    else{
        res.render('expired')
    }
}

exports.post_update_get = function(req, res, next){
    if(req.session.user!=null){
    async.parallel({
        poste: function(callback) {
            Poste.findById(req.params.id)
            .populate('nickname')
            .exec(callback);
        },
    }, function(err,results){
        if(err) {return next(err); }
        if(results.poste==null){ //No results.
            var err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }
        else
        res.render('post_form',{title: 'Update Post', poste: results.poste});
    })
    }
    else{
        res.render('expired')
    }
}

exports.post_update_post = [

    //body('nickname').isLength({min:1}).trim().withMessage('User not found'),
    //body('image').isLength({min:1}).trim().withMessage('Image is required.'),
    body('description').isLength({min:1,max:400}).trim().withMessage("Invalid description."),
    body('hide').isBoolean().withMessage('Access status error'),

    //sanitizeBody('nickname').escape(),
    //sanitizeBody('image').escape(),
    sanitizeBody('description').escape(),
    sanitizeBody('hide').toBoolean(),

    (req,res,next) => {
        if(req.session.user!=null){
        
        const errors = validationResult(req);
        const { image } = req.body.image;
        image.mv(path.resolve(_direname,'public/images',image.name),(err) =>{

            var poste = new Poste(
                {
            
                    nickname: req.session.user._id,
                    image: `/images/${image.name}`,
                    description: req.body.description,
                    hide: req.body.hide,
                    likes: 0,
                });

            if(!errors.isEmpty()) {
                res.render('post_form',{title: 'Update Post', poste: req.body, errors: errors.array() });
            }
            else{
                
                Poste.findByIdAndUpdate(req.params.id, poste, {}, function (err,thepost) {
                    if (err) { return next(err); }
                    
                    res.redirect(thepost.url);
                    });
                }
            })
        }
        else{
            res.render('expired')
        }
    }
];

exports.delete_posts = function(posts){
    posts.forEach(post => {
        async.parallel({
            post_comments: function(callback) {
              Comment.find({ 'post': post._id }).exec(callback)
              },
            post_tags: function(callback) {
                Tag.find({ 'post': post._id }).exec(callback)
            },
        }, function(err, results){
            if(err){return err}
            
            if(!results.post_tags.isEmpty()){
                results.post_tags.forEach(tags => {
                    Tag.findByIdAndDelete(tags._id)
                });
            }

            if(!results.post_comments.isEmpty()){
                results.post_comments.forEach( comment => {
                    Comment.findByIdAndDelete(comment._id)
                });
            }

            Poste.findByIdAndDelete(post._id);
        });
    });
}

exports.post_like = function(postid){
    
    Poste.find( { '_id': postid })
    .exec(function(err, post){
        if(err) {return next(err);}

        var a = post.likes;
        a = a+1;

        var postup = new Poste(
            {
        
                nickname: post.nickname,
                image: post.image,
                description: post.description,
                hide: post.hide,
                likes: a,
            });
        Poste.findByIdAndUpdate(post._id,postup);

    });
}

exports.post_like_delete = function(postid){
    
    Poste.find( { '_id': postid })
    .exec(function(err, post){
        if(err) {return next(err);}

        var a = post.likes;
        a = a-1;

        var postup = new Poste(
            {
        
                nickname: post.nickname,
                image: post.image,
                description: post.description,
                hide: post.hide,
                likes: a,
            });
        Poste.findByIdAndUpdate(post._id,postup);

    });
}