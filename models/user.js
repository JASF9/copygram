var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        firstname: {type: String, required: true, maxlength: 100},
        lastname: {type: String, required: true, maxlength: 100},
        _id: {type: String, required: true, maxlenght: 25},
        password:{type:String, required: true, maxlenght:20},
        email: {type: String, required: true},
        description: {type: String, maxlength: 400},
        social: [String],
        private: {type: Boolean},
        likes: {type: Number},
        following:{type: Number}
    }
);

UserSchema.virtual('nickname').get(function() {
    return this._id;
});

UserSchema.virtual('url').get(function(){
    return '../nav/user/' + this.nickname;
});

module.exports = mongoose.model('User', UserSchema);