const Mongoose = require('mongoose');

const FeedModel = new Mongoose.model("feed", {
    user:String,
    name:String,
    mail:String,
    subject:String,
    message:String, 
    timestamp:String

});

module.exports = FeedModel;