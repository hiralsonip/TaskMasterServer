const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({

    user_id: {
        type: Number,
        //required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        default: 'todolist'
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String,
        //required: true
    },
    phone_number: {
        type: String,
        required: true
    }

});

module.exports = Users = mongoose.model('users', UsersSchema);