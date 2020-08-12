var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var PosteSchema = new Schema(
    {
        nickname: {type: Schema.Types.String, ref: 'User'},
        image: {type:String, required: true},
        description: {type: String, maxlength: 300},
        date: {type:Date, default: Date.now},
        hide: {type: Boolean},
        likes: {type: Number},
    }
);

PosteSchema.virtual('url').get(function(){
    return '/nav/poste/' + this._id;
});

PosteSchema.virtual('date_formated').get(function () {
    return moment(this.date).format('DD MM YYYY');
})

module.exports = mongoose.model('Poste', PosteSchema);