//setting
//
var number_m = 3;
var number_row = 54;


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
var file = __dirname+'/data/items.json';
var WebSocket = require('ws');
var io = require('socket.io').listen(http);

app.use(express.static(__dirname + '/uploads'));
app.use(bodyParser.json());
app.use(cors());
require('dotenv').config();

//=========connect database
let database = require('./src/config/database');
database._connect();
//=========end connect database

function persentCoin(val1,val2){
    if(Number(val2)===0){
        return 0;
    }
    let t = (((val2-val1)/val2)*100).toFixed(2)
    return t;
}
//================API binabnce=====================
let coin = require('./src/controller/api/coin');
let config = require('./src/controller/api/coin_temp');

//================import config json=====================
config.addMany(
    [
        {type:'time_space', value:3},
        {type:'volum', value:100},
        {type:'number_result', value:45},
        {type:'up_precent', value:3},
        {type:'down_precent', value:3},
        {type:'time_alarm', value:3},
        {type:'time_blink', value:3},
    ]
).then().catch(err=>{
    //console.error(err)
});



app.get("/config",function(req,res){
    config._get().then(docs=>{
        res.json(docs)
    }).catch(err=>{});
})
app.post('/config',function(req,res){
    let data= req.body;
    config.update("time_space",Number(data.time_space)).then().catch();
    config.update("volum",Number(data.volum)).then().catch();
    config.update("up_precent",Number(data.up_precent)).then().catch();
    config.update("down_precent",Number(data.down_precent)).then().catch();
    config.update("time_alarm",Number(data.time_alarm)).then().catch();
    config.update("time_blink",Number(data.time_blink)).then().catch();
    config.update("number_result",Number(data.number_result)).then().catch();
    res.json("ok");
})

app.get('/detailCoint',function(req,res){
    let symbol = (req.query.symbol);
    coin._getDetail(symbol).then(docs => {
            res.json(docs)
        })
        .catch(err => {
            console.error(err)
        })
})
app.get('/deleteCoint',function(req,res){
    coin.deleteCoinFirst().then(docs => {
            res.json(docs)
        })
        .catch(err => {
            console.error(err)
        })
})
app.get('/changeAlert',function(req,res){
    let symbol = (req.query.symbol);
    let alert = (req.query.alert);
    coin.updateAlert(symbol,alert).then(docs => {
            res.json(docs)
        })
        .catch(err => {
            console.error(err)
        })
})
app.get('/getAlert',function(req,res){
    coin._getAlert().then(docs => {
        res.json(docs)
    })
    .catch(err => {
        console.error(err)
    })
})
//================end API binabnce=====================
//================Socket binabnce=====================
io.sockets.on('connection', function(socket){

    socket.on('channel1', (data) => {
        console.log(data);
        coin._get().then(docs => {
            var alarm =false;
            for(var i in docs){
                docs[i].minPercent = persentCoin(docs[i].maxPrice,docs[i].lastPrice);
                docs[i].maxPercent = persentCoin(docs[i].minPrice,docs[i].lastPrice);
                docs[i].status = '';
                if(Number(docs[i].minPercent) <= Number(data.down_percent)){
                    docs[i].status = 'down';
                }
                if(Number(docs[i].maxPercent) >= Number(data.up_percent)){
                    docs[i].status = 'up';
                }
                if(Number(docs[i].minPercent) <= Number(data.down_percent) && Number(docs[i].lastVolum) >=Number(data.volum)){
                    alarm = true;
                }
            }
            socket.emit('channel1-reply',{
                alarm : alarm,
                data : docs
            });
        }).catch(err => {
                console.error(err)
            })
    });
})
//================end Socket binabnce=====================
//================binabnce=====================

var coin_data = ["ltcbtc","bnbbtc","neobtc","bccbtc","gasbtc","mcobtc","wtcbtc","lrcbtc","qtumbtc","yoyobtc","omgbtc","zrxbtc","stratbtc","snglsbtc","bqxbtc","kncbtc","funbtc","snmbtc","iotabtc","linkbtc","xvgbtc","saltbtc","mdabtc","mtlbtc","subbtc","eosbtc","sntbtc","etcbtc","mthbtc","engbtc","dntbtc","zecbtc","bntbtc","astbtc","dashbtc","oaxbtc","icnbtc","btgbtc","evxbtc","reqbtc","vibbtc","trxbtc","powrbtc","arkbtc","xrpbtc","modbtc","enjbtc","storjbtc","kmdbtc","rcnbtc","nulsbtc","rdnbtc","xmrbtc","dltbtc","ambbtc","batbtc","bcptbtc","arnbtc","gvtbtc","cdtbtc","gxsbtc","poebtc","qspbtc","btsbtc","xzcbtc","lskbtc","tntbtc","fuelbtc","manabtc","bcdbtc","dgdbtc","adxbtc","adabtc","pptbtc","cmtbtc","xlmbtc","cndbtc","lendbtc","wabibtc","tnbbtc","wavesbtc","gtobtc","icxbtc","ostbtc","elfbtc","aionbtc","neblbtc","brdbtc","edobtc","wingsbtc","navbtc","lunbtc","trigbtc","appcbtc","vibebtc","rlcbtc","insbtc","pivxbtc","iostbtc","chatbtc","steembtc","nanobtc","viabtc","blzbtc","aebtc","rpxbtc","ncashbtc","poabtc","zilbtc","ontbtc","stormbtc","xembtc","wanbtc","wprbtc","qlcbtc","sysbtc","grsbtc","cloakbtc","gntbtc","loombtc","bcnbtc","ethbtc"]
for (var i = coin_data.length - 1; i >= 0; i--) {
    let symbol = coin_data[i].toUpperCase();
    coin.addOnly({"symbol": symbol}).then().catch(err=>{
        //console.error(err)
    });
}

var type_connect="@miniTicker";


//========socket=============
var url_socket = "";
var dataCoin =[];
for (var i = coin_data.length - 1; i >= 0; i--) {
    url_socket +='/'+ coin_data[i]+type_connect;
    dataCoin.push({ id: coin_data[i], "price": 0, "volum": 0 });
}
var connection = new WebSocket('wss://stream.binance.com:9443/ws'+url_socket);
connection.onopen = function() {
     console.log('Web Socket Connection Open');
};
connection.onerror = function(error) {console.log("Lỗi kết nối Server");};
connection.onmessage = function(message) {
        try {
            var json = JSON.parse(message.data);
            dataCoin.forEach((element, index) => {
                if((element.id).toUpperCase() == json.s) {
                    dataCoin[index].price=json.c;
                    dataCoin[index].volum=Number(json.q).toFixed(2);

                }
            });
        } catch (e) {
            console.log(e);
        }
}

io.sockets.on('connection', function (socket) {
    setInterval(function(){
        dataCoin.forEach((value, index) => {
            coin.update((value.id).toUpperCase() ,{'price':value.price,'volum':value.volum}).then().catch(err=>{
                console.log(err);
            })
        });
        coin.CountCoin().then(doc=>{
            if(doc[0].total>number_row){
                coin.deleteCoinFirst().then(doc=>{
                    console.log(doc);
                }).catch();
            }
        }).catch(err=>{})
        socket.emit('channel2-notification',true);
    },1000*60*number_m);
})

//========socket=============

http.listen(3001, function(){
    console.log('listening on *:3001');
});