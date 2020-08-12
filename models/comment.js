var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
    {
        user: {type: Schema.Types.String, ref: 'User'},
        content: {type: String, maxlength: 400},
        date: {type:Date, default: Date.now},
        post: {type: Schema.Types.ObjectId, ref: 'Poste'}
    }
);

CommentSchema.virtual('url').get(function(){
    return '/nav/comment/' + this._id;
});

CommentSchema.virtual('date_formated').get(function () {
    return moment(this.date).format('llll');
})

module.exports = mongoose.model('Comment', CommentSchema);