var Like = require('../models/like');
var post_controller = require('../controllers/postController');
var user_controller = require('../controllers/userController');
//var session = require('express-session');

exports.give_like = function(req,res,next) {
    if(req.session.user!=null){
        Like.find({'user':req.session.user._id, 'post': req.session.post._id})
        .exec(function(err,result){
            if(err){return next(err)}
            if(result==null){
                var like = new Like(
                    {
                        user: req.session.user._id,
                        post: req.session.post._id
                    }
                )
                like.save(function(err){
                    if(err) {return next(err);}
                    user_controller.user_like(req.session.user._id);
                    post_controller.post_like(req.session.post._id);
                
                    res.redirect(req.session.post.url);
                });
            }
            Like.findOneAndDelete({'user':req.session.user._id , 'post':req.session.post._id});
            user_controller.user_like_delete(req.session.user._id);
            post_controller.post_like_delete(req.session.post._id);
            res.redirect(req.session.post.url);
        })
  
    }
    else{
        res.redirect('expired')
    }
    
}