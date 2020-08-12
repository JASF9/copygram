var Comment = require('../models/comment');
const { body, sanitizeBody, validationResult } = require('express-validator');
//var session = require('express-session');

exports.comment_search = function(req, res){
    res.send('ni: comment search');
}

exports.comment_create_get = function(req, res){
    res.send('ni: comment create get');
}

exports.comment_create_post = [
    body('content').isLength({min:1}).trim().withMessage('Cannot publish empty comment.'),

    sanitizeBody('content').escape(),

    (req,res,next) => {
        if(req.session.user!=null){
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.redirect(req.session.post.url)
        }
        else{
            var comment = new Comment(
                {
                    user: req.session.user._id,
                    content:content,
                    post: req.session.post._id,
                }
            )
            comment.save(function(err){
                if(err) {return next(err);}
                
                res.redirect(req.session.post.url);
            });
        }
    }
    else{
        res.render('expired')
    }
    }
]

exports.comment_delete_get = function(req, res){
    res.send('ni: comment delete get');
}

exports.comment_delete_post = function(req, res, next){
    if(req.session.user!=null){
        Comment.findByIdAndDelete(req.params._id);
        res.redirect(req.session.post.url)
    }
    else{
        res.render('expired')
    }   
}

exports.comment_update_get = function(req, res){
    res.send('ni: comment update get');
}

exports.comment_update_post = function(req, res){
    res.send('ni: comment update post');
}