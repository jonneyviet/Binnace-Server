//setting
//
var number_m = 3;
var number_row = 100;
var express =  require('express');
var mongodb = require('mongodb');
let mongoose = require('mongoose')
var app      = express();
var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
var multer  = require('multer');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var cors = require('cors');
var WebSocket = require('ws');
var io = require('socket.io').listen(http);
app.use(bodyParser.json());
app.use(cors());
require('dotenv').config();

//=========firebase notification
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

//================API binabnce=====================
let coin        = require('./src/controller/api/coin');
let coin_temp   = require('./src/controller/api/coin_temp');
let coin_result   = require('./src/controller/api/coin_result');
let device = require('./src/controller/api/device');
//================binabnce=====================

var coin_data = ["ltcbtc","bnbbtc","neobtc","bccbtc","gasbtc","mcobtc","wtcbtc","lrcbtc","qtumbtc","yoyobtc","omgbtc","zrxbtc","stratbtc","snglsbtc","bqxbtc","kncbtc","funbtc","snmbtc","iotabtc","linkbtc","xvgbtc","saltbtc","mdabtc","mtlbtc","subbtc","eosbtc","sntbtc","etcbtc","mthbtc","engbtc","dntbtc","zecbtc","bntbtc","astbtc","dashbtc","oaxbtc","icnbtc","btgbtc","evxbtc","reqbtc","vibbtc","trxbtc","powrbtc","arkbtc","xrpbtc","modbtc","enjbtc","storjbtc","kmdbtc","rcnbtc","nulsbtc","rdnbtc","xmrbtc","dltbtc","ambbtc","batbtc","bcptbtc","arnbtc","gvtbtc","cdtbtc","gxsbtc","poebtc","qspbtc","btsbtc","xzcbtc","lskbtc","tntbtc","fuelbtc","manabtc","bcdbtc","dgdbtc","adxbtc","adabtc","pptbtc","cmtbtc","xlmbtc","cndbtc","lendbtc","wabibtc","tnbbtc","wavesbtc","gtobtc","icxbtc","ostbtc","elfbtc","aionbtc","neblbtc","brdbtc","edobtc","wingsbtc","navbtc","lunbtc","trigbtc","appcbtc","vibebtc","rlcbtc","insbtc","pivxbtc","iostbtc","chatbtc","steembtc","nanobtc","viabtc","blzbtc","aebtc","rpxbtc","ncashbtc","poabtc","zilbtc","ontbtc","stormbtc","xembtc","wanbtc","wprbtc","qlcbtc","sysbtc","grsbtc","cloakbtc","gntbtc","loombtc","bcnbtc","ethbtc","agibtc","ardrbtc","cvcbtc","databtc","dentbtc","dockbtc","gobtc","grsbtc","hcbtc","hotbtc","iotxbtc","keybtc","mftbtc","nasbtc","npxsbtc","nxsbtc","paxbtc","phxbtc","polybtc","qkcbtc","rdnbtc","repbtc","rvnbtc","scbtc","skybtc","thetabtc","tusdbtc","vetbtc","zenbtc"]

let insertFirst = async () =>{
    await coin_data.forEach((value,key) =>{
        coin_temp.addMany({
            'symbol':value.toUpperCase(),
            'price':0,
            'volume':0
        })
    })
}
insertFirst();

//========Get data to socket binance=============
for (var i = coin_data.length - 1; i >= 0; i--) {
    let connection = new WebSocket('wss://stream.binance.com:9443/ws/'+coin_data[i]+'@miniTicker');
    connection.onopen = function() {};//open connect
    connection.onerror = function(error) {console.log("Can not connection socket Binnace");};
    connection.onmessage = async function(message) {
        try {
            let json = JSON.parse(message.data);
            let countCoin =await coin_temp.countCoinTemp();
            if(countCoin>=coin_data.length){
                coin_temp.update((json.s).toUpperCase(),{
                        price:json.c,
                        volume:Number(json.q).toFixed(2)
                    }).then(doc => {});
            }

        } catch (e) {
            console.log(e);
        }
    }
}


let calPercent = (v1,v2) => {
    let val1 =  Number(v1);
    let val2 =  Number(v2);
    if (Number(val2) === 0) {
        return 0;
    }
    let t = (((val2 - val1) / val2) * 100).toFixed(2)
    return Number(t);
}
let insertManyCoin =async () => {
    let getCoinTemp = await coin_temp.getData();//lay du lieu coin tam khong co gia tri 0 null
    await coin.insertManyCoin(getCoinTemp);//them tat ca coin vao bang coins
    let countCoin = await coin.CountCoin2();
    await countCoin.forEach(async (value, index) => {
        if(value.count>=number_row){
            await coin.deleteCoin(value._id,value.date)
        }
    });
    let resultCoin = await coin.getResult();//lay coin sau khi loc de dua vao bang ket qua
    let countCoinResult =await coin_result.getCount();
    if(countCoinResult>0){
        await resultCoin.forEach(async (value, index) => {
            let data ={
                "lastPrice":value.data.lastPrice,
                "lastVolume":value.data.lastVolume,
                "minPercent":calPercent(value.data.max,value.data.lastPrice),
                "maxPercent":calPercent(value.data.min,value.data.lastPrice)
            }
            await coin_result.update(value.symbol,data);
        });
    }else{
        await resultCoin.forEach(async (value, index) => {
            let data ={
                "symbol" :value.symbol,
                "lastPrice":value.data.lastPrice,
                "lastVolume":value.data.lastVolume,
                "minPercent":calPercent(value.data.max,value.data.lastPrice),
                "maxPercent":calPercent(value.data.min,value.data.lastPrice)
            }
            await coin_result.insertResultCoin(data);
        });
    }
    // //action notification
    let deviceData = await device.findDevice();
    await deviceData.forEach(async (value, index) => {
        if(typeof(value.volume)!="undefined") {
            let countCoinNoti = await coin_result.findNotification(value.max,value.volume);
            let symbolsNotNoti = value.symbols;
            let notification = false;
            let countCoinUp = countCoinNoti.length;
            if(countCoinNoti.length>0){
                countCoinNoti.forEach(async (value, index) =>{
                    if(symbolsNotNoti.indexOf(value.symbol) === -1){
                        notification =  true;
                    }else{
                        countCoinUp=countCoinUp-1
                    }
                })
                //action notification to device token
                if(notification){
                    // //firebase
                    var  registrationToken = value.token;
                    var  payload = {
                        notification: {
                            title: "Thông báo coin",
                            body: "Hiện có "+ countCoinUp +" coin tăng trên "+ value.max + " (%) và khối lượng trên " + value.volume,
                            icon:'default',
                            sound:'default',
                            tag:'thongbaocoin2017'
                        }
                    };
                    var options = {
                        priority: "high",
                        timeToLive: 60 * 60 *24
                    };
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then((response) => {
                            console.log('Successfully sent message:', response);
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error);
                        });
                }
            }
        }
    });
    //end action notification
}
//insertManyCoin();
setInterval(function(){
    insertManyCoin().then(() =>{
        console.log("insert many coin");
    });
},1000*60*number_m);
http.listen(3002, function(){
    console.log('listening on *:3002');
});