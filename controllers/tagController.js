var Tag = require('../models/tag');
var notif = require('../controllers/messageController');

//var session = require('express-session');

const { body, sanitizeBody,validationResult } = require('express-validator');
const { nextTick } = require('async');

exports.tag_search = function(req, res){
    res.send('ni: tag search');
}

exports.tag_create_get = function(req, res){
    res.send('ni: tag create get');
}

exports.tag_create_post = [
    body('user').isLength({min:1}).withMessage('Must add the tagged user nickname'),

    sanitizeBody('user').escape(),

    (req,res,next) => {
        if(req.session.user!=null){
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.redirect(req.session.post.url);
        }
        else{
            var tag = new Tag(
                {
                    user: req.body.user,
                    post: req.session.post._id,
                }
            )
            tag.save(function(err){
                if(err) {return next(err);}
                notif.notification_tag(req.body.user,req.session.user._id);
                res.redirect(req.session.post.url);
            });
        }
    }
    else{
        res.render('expired')
    }
    }
]

exports.tag_delete_get = function(req, res){
    res.send('ni: tag delete get');
}

exports.tag_delete_post = function(req, res, next){
    if(req.session.user!=null){
    Tag.find({'user':req.body.nickname,'post':req.params.post._id})
    .populate('user')
    .populate('post')
    .exec(function (err,tag){
        if(err) {return next(err)}
        Tag.findByIdAndDelete(tag._id);
        res.redirect(req.session.post.url)
    })
    }
    else{
        res.render('expired')
    }
}

