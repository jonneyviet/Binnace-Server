let mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);

let Coin_temp = new mongoose.Schema({
    symbol:{
        type: String,
        required:true,
        unique:true,
    },
    price:String,
    date:{type: Date, default: Date.now},
    volume:Number,
})
module.exports = mongoose.model('coin_temp', Coin_temp)