let mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
let Device = new mongoose.Schema({
    token:{
        type: String,
        required:true,
        unique:true,
    },
    symbols:Array,
    min:Number,
    max:Number,
    volume:Number
})
module.exports = mongoose.model('devices', Device)