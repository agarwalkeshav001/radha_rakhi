const Mongoose = require('mongoose');

const UserModel = new Mongoose.model("user", {
    username: {
        type: String,
        unique:true
    },
    password: String,
    role: String
});

module.exports = UserModel;