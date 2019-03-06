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
let coin = require('./src/controller/api/coin');
io.sockets.on('connection', function(socket){
    socket.on('channel1', (data) => {
        console.log("chanel1 socket",data);
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
//socket.emit('channel2-notification',true);


http.listen(3003, function(){
    console.log('listening on *:3003');
});