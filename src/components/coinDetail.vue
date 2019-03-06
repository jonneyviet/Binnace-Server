<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <h1>{{$route.params.id}}</h1>
                <div class="btn-group">
                    <router-link :to="{ name: 'setting'}" v-bind:class="['btn','btn-primary']">Setting</router-link><router-link :to="{ name: 'coin'}" v-bind:class="['btn','btn-danger']">Home</router-link>
                </div>
                <table class="table">
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Price</th>
                        <th>Volum</th>
                        <th>Persent</th>
                        <th>Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item, i) in dulieu" v-bind:class="[(status_down(cal(lastprice,item.price)))? 'down-class' : '',(status_up(cal(lastprice,item.price)))? 'up-class' : '']">
                        <td>{{++i}}</td>
                        <td>{{item.price}}</td>
                        <td>{{item.volum}}</td>
                        <td>{{cal(lastprice,item.price)}}</td>
                        <td>{{convertTime(item.date)}}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>

</template>
<script>
    
    export default{
        data(){
            return {
                dulieu:[],
                lastprice:0,
                down_precent:-2,
                up_precent:3,
                volum:0,
                time_alarm:0,
                time_blink:0,
            }
        },
        created:function(){
            this.getConfig();
            this.getItems();
        },
        methods: {
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
            getItems() {
                this.axios.get("http://localhost:3001/detailCoint?symbol="+this.$route.params.id).then((response) => {
                    this.dulieu =response.data[0].i;
                    this.lastprice = response.data[0].lastPrice;
                });
            },
            convertTime(t){
                let date = new Date(t);
                var hour = date.getHours();
                hour = (hour < 10 ? "0" : "") + hour;
                var min  = date.getMinutes();
                min = (min < 10 ? "0" : "") + min;
                var sec  = date.getSeconds();
                sec = (sec < 10 ? "0" : "") + sec;
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                month = (month < 10 ? "0" : "") + month;
                var day  = date.getDate();
                day = (day < 10 ? "0" : "") + day;
                return day + "/" + month + "/" + year + " - " + hour + ":" + min + ":" + sec;
            },
            cal(priceLast,price){
                if(Number(priceLast)===0){
                    return 0;
                }else{
                    let persent = (((priceLast-price)/priceLast)*100);
                    if(persent){
                        return persent.toFixed(2)
                    }else{
                        return 0;
                    }
                }
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
    .down-class{
        background: #cc0000;
        color: #fff;
    }
    .up-class{
        background: #006600;
        color: #fff;
    }
</style>