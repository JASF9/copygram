var express = require('express');
var router = express.Router();

var comment_controller = require('../controllers/commentController');
var follow_controller = require('../controllers/followController');
var message_controller = require('../controllers/messageController');
var post_controller = require('../controllers/postController');
var tag_controller = require('../controllers/tagController');
var user_controller = require('../controllers/userController');
var like_controller = require('../controllers/likeController');

router.get('/',post_controller.index);

router.get('/user/create', user_controller.user_create_get);
router.post('/user/create',user_controller.user_create_post);
router.get('/user/:id/delete',user_controller.user_delete_get);
router.post('/user/:id/delete',user_controller.user_delete_post);
router.get('/user/:id/update',user_controller.user_update_get);
router.post('/user/:id/update',user_controller.user_update_post);
router.get('/login',user_controller.user_login_get);
router.post('/login',user_controller.user_login_post);
router.get('/user/:id',user_controller.user_detail);
router.get('/user/search',user_controller.user_search);

router.get('/poste/create',post_controller.post_create_get);
router.post('/poste/create',post_controller.post_create_post);
router.get('/poste/:id/delete',post_controller.post_delete_get);
router.post('poste/:id/delete',post_controller.post_delete_post);
router.get('/poste/:id/update',post_controller.post_update_get);
router.post('poste/:id/update',post_controller.post_update_post);
router.get('/poste/list',post_controller.post_list);
router.get('/poste/:id',post_controller.post_detail);

router.get('/comment/create',comment_controller.comment_create_get);
router.post('/comment/create',comment_controller.comment_create_post);
router.get('/comment/:id/delete',comment_controller.comment_delete_get);
router.post('/comment/:id/delete',comment_controller.comment_delete_post);
router.get('/comment/:id/update',comment_controller.comment_update_get);
router.post('/comment/:id/update',comment_controller.comment_update_post);
router.get('/comment/list',comment_controller.comment_search);

router.get('/tag/create',tag_controller.tag_create_get);
router.post('tag/create',tag_controller.tag_create_post);
router.get('/tag/delete',tag_controller.tag_delete_get);
router.post('/tag/delete', tag_controller.tag_delete_post);
router.get("/tag/list",tag_controller.tag_search);

//router.get('/follow/create',follow_controller.follow_create_get);
router.get('/follow/create',follow_controller.follow_create_post);
router.get('/follow/delete',follow_controller.follow_delete_get);
router.post('/follow/delete',follow_controller.follow_delete_post);
router.get('/follow/:user/search',follow_controller.follow_search);

router.get('/message/create', message_controller.message_create_get);
router.post('/message/create',message_controller.message_create_post);
router.get('/message/list',message_controller.message_list);

router.get('/like',like_controller.give_like);

module.exports = router;