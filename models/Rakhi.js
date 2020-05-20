const Mongoose = require('mongoose');

const RakhiModel = new Mongoose.model("rakhi", {
    name:String,
    type: String,
    typ: String,
    pieces:String,
    price: String,
    typequan:String,
    pricequan:String,
    sprice:String,
    img: String
});

module.exports = RakhiModel;