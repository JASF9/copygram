var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FollowSchema = new Schema(
    {
        user: {type: Schema.Types.String, ref: 'User'},
        follower: {type: Schema.Types.String, ref: 'User'},
    }
);

FollowSchema.virtual('url').get(function(){
    return '/nav/follow/' + this._id;
});

module.exports = mongoose.model('Follow', FollowSchema);