const Mongoose = require('mongoose');

const WordwModel = new Mongoose.model("wordw", {
    keyword:{
        type:String,
    }
});

module.exports = WordwModel;

