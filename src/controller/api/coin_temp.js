let coinTempModel = require('../../model/coin_temp');
class Coin_temp {
    addMany(data){
        return coinTempModel.insertMany(data)
    }
    findCoin(data) {
        return coinTempModel.find({'symbol':data}).countDocuments();
    }
    update(symbol,data){
        return coinTempModel.findOneAndUpdate(
            {symbol:symbol},
            {
                $set:data
            }
        );
    }
    getData(){
        return coinTempModel.find(
            {
                $and:[
                    {price:{$gt:0}},
                    {volume:{$gt:0}}
                    ]
            },{
                _id:0,__v:0,date:0
            });
    }
    countCoinTemp(){
        return coinTempModel.find({}).countDocuments();
    }
}
module.exports = new Coin_temp();