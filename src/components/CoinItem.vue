<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <h1>Home</h1>
                <router-link :to="{ name: 'setting'}" v-bind:class="['btn','btn-primary']">Setting</router-link>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <table class="table">
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th></th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Volum</th>
                        <th>Max(%)</th>
                        <th>Min(%)</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, i) in dulieu" v-bind:class="[(status_down(item.minPercent))? 'down-class' : '',(status_up(item.maxPercent))? 'up-class' : '']">
                        <td>{{++i}}</td>
                        <th><input type="checkbox" name="checklist" v-bind:value="item._id" v-model="item.alert"
                         v-on:change="changeAlert(item._id,item.alert)"></th>
                        <td>{{item._id}}</td>
                        <td>{{item.lastPrice}}</td>
                        <td>{{item.lastVolum}}</td>
                        <td>{{item.maxPercent}}</td>
                        <td>{{item.minPercent}}</td>
                        <td><router-link :to="{ name: 'coinDetail', params: { id: item._id }}"><span class="glyphicon glyphicon-arrow-right" aria-hidden="true"></span></router-link></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>
<script>
    export default{
        sockets: {
            disconnect: function () {
                console.log('socket to notification channel disconnected')
            },
            connect: function () {
                console.log('socket to notification channel connected')
            },
            punch: function (val) {
            }
        },
        data(){
            return {
                dulieu:[],
                checkAlert:[],
                down_precent:-2,
                up_precent:3,
                volum:0,
                time_alarm:0,
                time_blink:0,
            }
        },
        created:function(){
            this.getAlert(this.checkAlert);
            this.getConfig();
            this.$options.sockets.greeting = (data) => {
                this.dulieu=data;
                //console.log(data);
            }
        },
        methods: {
            changeAlert(symbol,alert){
                this.axios.get(this.pathServerApi+"/changeAlert?symbol="+symbol+"&alert="+alert).then((response) => {

                });
            },
            getAlert(t){
                this.axios.get(this.pathServerApi+"/getAlert").then((response) => {
                   let data =response.data
                    data.forEach(function(value,key){
                        t.push(value.symbol);
                    })
                });
            },
            getConfig(){
                this.axios.get(this.pathServerApi+"/config").then((response) => {
                    let data =response.data
                    for(var i in data){
                        if(data[i].type=="volum"){
                            this.volum= data[i].value
                        }if(data[i].type=="up_precent"){
                            this.up_precent= data[i].value
                        }if(data[i].type=="down_precent"){
                            this.down_precent= data[i].value
                        }if(data[i].type=="time_alarm"){
                            this.time_alarm= data[i].value
                        }if(data[i].type=="time_blink"){
                            this.time_blink= data[i].value
                        }
                    }
                });
            },
            status_down(minPercent){
                if(Number(minPercent)<=Number(this.down_precent)){
                    return true;
                }
                return false;
            },
            status_up(maxPercent){
                if(Number(maxPercent)>=Number(this.up_precent)){
                    return true;
                }
                return false;
            }

        }

    }
</script>
<style scoped>
    .form-inline{
        margin: 10px 0px;
    }
    .down-class{
        background: #cc0000;
        color: #fff;
    }
    .up-class{
        background: #006600;
        color: #fff;
    }
</style>