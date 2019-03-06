let mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
let Coin_result = new mongoose.Schema({
    symbol:{
        type: String,
        required:true,
        unique:true,
    },
    lastPrice:String,
    lastVolume:Number,
    minPercent:Number,
    maxPercent:Number
})
module.exports = mongoose.model('coin_result', Coin_result)