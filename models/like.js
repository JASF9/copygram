var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LikeSchema = new Schema(
    {
        user: {type: Schema.Types.String, ref: 'User'},
        post: {type: Schema.Types.ObjectId, ref: 'Poste'},
    }
);

LikeSchema.virtual('url').get(function(){
    return '/nav/like/' + this._id;
});

module.exports = mongoose.model('Like', LikeSchema);