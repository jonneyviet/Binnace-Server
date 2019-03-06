let mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
var SchemaTypes = mongoose.Schema.Types;

let Coin = new mongoose.Schema({
    symbol:{
    	type: String,
    	required:true
    },
    price:String,
    date:{type: Date, default: Date.now},
    volume:Number,
})
module.exports = mongoose.model('coin', Coin)