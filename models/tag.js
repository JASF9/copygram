var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagSchema = new Schema(
    {
        user: {type: Schema.Types.String, ref: 'User'},
        post: {type: Schema.Types.ObjectId, ref: 'Poste'},
    }
);

TagSchema.virtual('url').get(function(){
    return '/nav/tag/' + this._id;
});

module.exports = mongoose.model('Tag', TagSchema);