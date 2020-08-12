var Follow = require('../models/follow');
var notif = require('../controllers/messageController');
var user_controller = require('../controllers/userController');
//var session = require('express-session');

const { body, sanitizeBody,validationResult } = require('express-validator');

exports.follow_search = function(req, res){
    res.send('ni: follow search');
}

exports.follow_create_get = function(req, res){
    res.send('ni: follow create get');
}

exports.follow_create_post = [
    body('user').isLength({min:1}).withMessage('Must add the nickname to follow'),

    sanitizeBody('user').escape(),

    (req,res,next) => {
        if(req.session.user!=null){
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.redirect(req.session.post.url);
        }
        else{
            var follow = new Follow(
                {
                    user: req.body.user,
                    follower: req.session.user._id,
                }
            )
            follow.save(function(err){
                //?
                if(err) {return next(err);}
                user_controller.user_follow(req.body.user)
                notif.notification_follow(req.body.user, req.session.user._id);
                //res.redirect(req.url);
                res.redirect(req.session.post.url);
            });
        }
        }
        else{
            res.render('expired')
        }

    }
]

exports.follow_delete_get = function(req, res){
    res.send('ni: follow delete get');
}

exports.follow_delete_post = function(req, res){
    if(req.session.user!=null){
    Follow.find({'user':req.body.nickname,'follower':req.session.user._id})
    .populate('user')
    .populate('follower')
    .exec(function (err,follow){
        if(err) {return next(err)}
        Follow.findByIdAndDelete(follow._id);
        user_controller.user_follow_delete(req.body.nickname)
        res.redirect(req.session.post.url)
    })
    }
    else{
        res.render('expired')
    }
}
