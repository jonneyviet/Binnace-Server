let coinResultModel = require('../../model/coin_result');
class Coin_result {
    getCount(){
        return coinResultModel.find({}).countDocuments();
    }
    insertResultCoin(data){
        return coinResultModel.insertMany(data)
    }
    update(symbol,data){
        return coinResultModel.findOneAndUpdate(
            {symbol:symbol},
            {
                $set:data
            }
        );
    }
    getAll(){
        return coinResultModel.find({}).sort({symbol:1});
    }
    findNotification(max,volume){
        return coinResultModel.find({$and : [{maxPercent: {$gte : max}},{lastVolume : {$gte: volume}}]});
    }
}
module.exports = new Coin_result();