let coinDeviceModel = require('../../model/device');
class Coin_result {
    findDevice(){
        return coinDeviceModel.find();
    }
    findDeviceToken(token){
        return coinDeviceModel.find({token:token});
    }
    addConfigDevice(data){
        return coinDeviceModel.insertMany(data)
    }
    checkExistsDevice(token){
        return coinDeviceModel.find({token:token}).countDocuments();
    }
    updateConfigDevice(token,data){
        return coinDeviceModel.findOneAndUpdate(
            {token:token},
            {
                $set:data
            }
        );
    }
    updateSymbol(token,symbol){
        return coinDeviceModel.findOneAndUpdate(
            {token:token},
            {
                $push:{"symbols": symbol}
            }
        );
    }
    removeSymbol(token,symbol){
        return coinDeviceModel.findOneAndUpdate(
            {token:token},
            {
                $pull:{"symbols": {$in: symbol}}
            }
        );
    }
}
module.exports = new Coin_result();