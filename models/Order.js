const Mongoose = require('mongoose');

const OrderModel = new Mongoose.model("order", {
    user:{
        type:String,
          
    },
    name:{
        type:String,
          
    },
    firm:{
        type:String,
          
    },
    mail:{
        type:String,
          
    },
    phone:{
        type:String,
          
    },
    phn:{
        type:String,
    },
    address:{
        type:String,
          
    },
    city:{
        type:String,
          
    },
    zip:{
        type:String,
          
    },
    country:{
        type:String,
          
    },
    state:{
        type:String,
         
    },
    ord:{
        type:Array,
    },
    total:String,
    timestamp:String,
    comment:{
        type:String,
    },

});

module.exports = OrderModel;