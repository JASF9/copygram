var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var MessageSchema = new Schema(
    {
        user: {type: Schema.Types.String, ref: 'User'},
        content: {type: String},
        date: {type:Date, default: Date.now},
        seen: {type: Boolean}
    }
);

MessageSchema.virtual('url').get(function(){
    return '/nav/message/' + this._id;
});

MessageSchema.virtual('date_formated').get(function () {
    return moment(this.date).format('DD MM YYYY');
})

module.exports = mongoose.model('Message', MessageSchema);

