//setting
//

var express =  require('express');
var mongodb = require('mongodb');
let mongoose = require('mongoose')
var app      = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cors = require('cors');
var io = require('socket.io').listen(http);
app.use(bodyParser.json());
app.use(cors());
require('dotenv').config();

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://my-project-1501063330795.firebaseio.com"
});

//=========connect database
let database = require('./src/config/database');
database._connect();
//=========end connect database
function persentCoin(v1,v2){
    let val1 = Number(v1);
    let val2 = Number(v2);
    if(val2===0){
        return 0;
    }
    let t = (((val2-val1)/val2)*100).toFixed(2)
    return t;
}
function checkStatusCoin(configPercentMin,configPercentMax,minPerCent,maxPerCent,configVolume,volume){
    let t="";
    if(Number(minPerCent) <= Number(configPercentMin)){
        t= "down"
    }
    if(Number(maxPerCent) >=Number(configPercentMax) && Number(volume) >= Number(configVolume)){
        t = "up"
    }
    return t;
}
function checkStatusCoin2(configPercent,minPerCent,maxPerCent,configVolume,volume){
    let t="";
    if(Number(configPercent) <= Number(minPerCent)){
        t= "down"
    }
    if(Number(configPercent) >=Number(maxPerCent)){
        t = "up"
    }
    return t;
}
//================API binabnce=====================
let coinResult = require('./src/controller/api/coin_result');
let coin = require('./src/controller/api/coin');
let device = require('./src/controller/api/device');
app.get("/getAll",async function(req,res){
    let token = req.query.token;
    let status = req.query.status;
    let deviceData = await device.findDeviceToken(token);
    if(typeof(req.query.token)=='undefined'){
       res.status(404).send({ error: "Not found config data"});
    }else{
        coinResult.getAll().then(docs=>{
            let data =[];
            if(typeof(status)!="undefined"){
                if(status=="up"){
                    docs.forEach( async (value, index) =>{
                        if(value.maxPercent>=deviceData[0].max && value.lastVolume>=deviceData[0].volume){
                            await data.push({
                                "symbol":value.symbol,
                                "price":value.lastPrice,
                                "volume":value.lastVolume,
                                "min":value.minPercent,
                                "max":value.maxPercent,
                                "status": checkStatusCoin(deviceData[0].min,deviceData[0].max,value.minPercent,value.maxPercent,deviceData[0].volume,value.lastVolume),
                                "alert":  (deviceData[0].symbols.indexOf(value.symbol) === -1)?true:false
                            })
                        }
                    })
                }else{
                    docs.forEach( async (value, index) =>{
                        if(value.minPercent<=deviceData[0].min) {
                            await data.push({
                                "symbol": value.symbol,
                                "price": value.lastPrice,
                                "volume": value.lastVolume,
                                "min": value.minPercent,
                                "max": value.maxPercent,
                                "status": checkStatusCoin(deviceData[0].min, deviceData[0].max, value.minPercent,value.maxPercent,deviceData[0].volume,value.lastVolume),
                                "alert": (deviceData[0].symbols.indexOf(value.symbol) === -1) ? true : false
                            })
                        }
                    })
                }
            }else{
                 docs.forEach( async (value, index) =>{
                    await data.push({
                        "symbol":value.symbol,
                        "price":value.lastPrice,
                        "volume":value.lastVolume,
                        "min":value.minPercent,
                        "max":value.maxPercent,
                        "status": checkStatusCoin(deviceData[0].min,deviceData[0].max,value.minPercent,value.maxPercent,deviceData[0].volume,value.lastVolume),
                        "alert":  (deviceData[0].symbols.indexOf(value.symbol) === -1)?true:false
                    })
                })
            }
            res.json({'data':data})
        }).catch(err=>{});
    }
});

app.get("/getDetail",async function(req,res){
    let token = req.query.token;
    let symbol = req.query.symbol;
    let deviceData = await device.findDeviceToken(token);
    // let volume = deviceData[0].volume;
    let max = deviceData[0].max;
    let min = deviceData[0].min;
    let volume = deviceData[0].volume;

    coin.getDetail(symbol).then(docs=>{
        let data = [];
        let firstPrice = docs[0].price;
        docs.forEach( async (value, index) =>{
            await data.push({
                "price":value.price,
                "volume":value.volume,
                "date":value.date,
                "percent": persentCoin(value.price,firstPrice),
                "status": checkStatusCoin2(persentCoin(value.price,firstPrice),min,max,volume,value.volume)
            })
        })
         res.json({'data':data});
    }).catch(err=>{});
});
app.get("/addDevice",async function(req,res){
    let checkExists = await device.findDeviceToken(req.query.token);
    if(checkExists.length!=0){
        let data = {
            "volume"        : req.query.volume,
            "min"           : req.query.min,
            "max"           : req.query.max,
        };
        device.updateConfigDevice(req.query.token,data).then(() =>{
            res.json({'message':"Action update success!"});
        })
    }else{
        let data = {
            "token"         : req.query.token,
            "volume"        : req.query.volume,
            "min"           : req.query.min,
            "max"           : req.query.max,
        };
        device.addConfigDevice(data).then(() =>{
            res.json({'message':"Action add success!"});
        })
    }
})
app.get("/configNotification",async function(req,res){
    let token = req.query.token;
    let symbol = req.query.symbol;
    let checkExists = await device.findDeviceToken(token);
    if(typeof(checkExists[0].symbols) === "undefined"){
        await device.updateConfigDevice(token,{"symbols":[symbol]});
        res.json({'message':symbol + " won't receive notification sound!"});
    }else{
        if(checkExists[0].symbols.indexOf(symbol) > -1){
        await device.removeSymbol(token,symbol);
             res.json({'message':symbol + " will receive notification sound!"});
        }else{
            await device.updateSymbol(token,symbol);
            res.json({'message':symbol + " won't receive notification sound!"});
        }
    }
});
app.get("/getConfig",async function(req,res){
    let token = req.query.token;
    let data = await device.findDeviceToken(token);
    res.json({'data':data});
})

http.listen(3001, function(){
    console.log('listening on *:3001');
});
// //firebase
// var  registrationToken = 'dwRCDjWAsvY:APA91bEOGrOjX9Wf2_zXqVrrvP1WpymTo3AyOnD96FnOt5gLPc-_PU8R5-PKRRKlmo9VdzCpUke6ETzwg3tiX16YCEYMXZpMH2ov9aCYDWIXkWrtcOSBCDa59PsFJPweYvzU93LwcNbz'
// var  payload = {
//     notification: {
//         title: "Thông báo coin ",
//         body: "Thiện đang có coin tăng theo cài đặt."
//     }
// };
// var options = {
//     priority: "high",
//     timeToLive: 60 * 60 *24
// };

// // Send a message to the device corresponding to the provided
// // registration token.
// admin.messaging().sendToDevice(registrationToken, payload, options)
//     .then((response) => {
//         // Response is a message ID string.
//         console.log('Successfully sent message:', response);
//     })
//     .catch((error) => {
//         console.log('Error sending message:', error);
//     });