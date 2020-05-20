const Mongoose = require('mongoose');

const ProductModel = new Mongoose.model("product", {
    keyword:{
        type:String,
    }
});

module.exports = ProductModel;

