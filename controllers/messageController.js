var Message = require('../models/message');
var User = require('../models/user');
var Follow = require('../models/follow');
var Comment = require('../models/comment');
var Tag = require('../models/tag');
//var session = require('express-session');

var async = require('async');
const { render } = require('../app');

exports.message_list = function(req, res, next){
    console.log(req.session.user._id)
    Message.find({'user': req.session.user._id})
    .populate('user')
    .exec(function(err, list_messages){
        if(err) {return next(err)}

        list_messages.sort(function(a,b){
            var c = new Date(a.date).getTime();
            var d = new Date(b.date).getTime();
            return c > d ? 1 : -1;
        })
        res.render('message_list',{title: 'Messages', message_list: list_messages});
    });
};

exports.message_create_get = function(req, res){
    res.send('ni: message create get');
}

exports.message_create_post = function(req, res){
    res.send('ni: message create post');
}

exports.notification_post = function(nickname){

    Follow.find({'user':nickname})
    .populate('user')
    .populate('follower')
    .exec(function(err,follow_list){
        if(!err) {
            follow_list.forEach(follower => {
                follower = follow_list.follower;
                var cont = 'The user '+ nickname +' has made a new post.';
                var message = new Message(
                    {
                        user: follower._id,
                        content: cont,
                        seen: false,
                    }
                )
                message.save();
            });
        }

    });
}

exports.notification_follow = function(nickname,follower){

    var cont = 'The user' + follower + 'is following you.'
    var message = new Message(
        {
            user: nickname,
            content: cont,
            seen:false,
        }
    )
    message.save();
}

exports.notification_tag = function(nickname,owner){

    var cont = 'The user' + owner + 'has tagged you in their post.'
    var message = new Message(
        {
            user: nickname,
            content: cont,
            seen:false,
        }
    )
    message.save();
}