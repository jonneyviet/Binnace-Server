let CoinModel = require('../../model/coin');
class Coin {
    insertManyCoin(data){
        return CoinModel.insertMany(data)
    }
    getResult(){
        return CoinModel.aggregate([
            // {$sort: {price: 1}},
            {
                $group: {
                    _id: "$symbol",
                    min:{$min:"$price"},
                    max:{$max:"$price"},
                    lastPrice:{$last:"$price"},
                    lastVolume:{$last:"$volume"},
                }
            },
            {
                $project:{
                    symbol:"$_id",
                    data:{
                        lastPrice:"$lastPrice",
                        lastVolume:"$lastVolume",
                        min:"$min",
                        max:"$max"
                    },
                    _id:0,
                }
            }
        ])
    }
    CountCoin(){
       return CoinModel.find({symbol:"ETHBTC"}).countDocuments();
    }
    CountCoin2(){
       return CoinModel.aggregate([
            {
                $group: {
                    _id: "$symbol",
                    date:{$first:"$date"},
                    count:{$sum:1}
                }
            },
        ])
    }
    deleteCoin(symbol,date){
        return CoinModel.remove({symbol:symbol,date:date})
    }
    getDetail(symbol){
        return CoinModel.find({symbol:symbol}).sort({date:-1});
    }
}
module.exports = new Coin();