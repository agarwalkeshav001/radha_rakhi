const Mongoose = require('mongoose');

const WordModel = new Mongoose.model("word", {
    keyword:{
        type:String,
    }
});

module.exports = WordModel;

