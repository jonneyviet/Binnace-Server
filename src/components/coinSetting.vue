<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <h1>Setting</h1>
                <div class="btn-group">
                    <router-link :to="{ name: 'coin'}" v-bind:class="['btn','btn-danger']">Home</router-link>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
               
                <form class="form-horizontal col-md-12" v-on:submit="sendConfig">
                   <!--  <div class="form-group">
                        <label for="exampleInputName2">Mimute</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.time_space" >
                    </div>
                    <div class="form-group">
                        <label for="exampleInputName2">Number result</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.number_result" >
                    </div> -->
                    <div class="form-group">
                        <label for="exampleInputName2">Volum</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.volum" >
                    </div>
                    <div class="form-group">
                        <label for="exampleInputName2">Up precent(%)</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.up_precent" >
                    </div>
                    <div class="form-group">
                        <label for="exampleInputName2">Down precent(%)</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.down_precent" >
                    </div>
                    <div class="form-group">
                        <label for="exampleInputName2">Time alarm(s)</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.time_alarm" >
                    </div>
                    <div class="form-group">
                        <label for="exampleInputName2">Time blink(s)</label>
                        <input type="text" class="form-control" id="" placeholder="" v-model="config.time_blink" >
                    </div>
                  <button type="submit" class="btn btn-primary">Save</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
    export default{
        data(){
            return {
                config:{
                    volum:null,
                    up_precent:null,
                    down_precent:null,
                    time_alarm:null,
                    time_blink:null,
                }
            }
        },
        created:function(){
            this.getConfig();
        },
        watch:{
        },
        methods: {
            getConfig(){
                this.axios.get(this.pathServerApi+"/config").then((response) => {
                    let data =response.data
                    for(var i in data){
                        if(data[i].type=="volum"){
                            this.config.volum= data[i].value
                        }if(data[i].type=="up_precent"){
                            this.config.up_precent= data[i].value
                        }if(data[i].type=="down_precent"){
                            this.config.down_precent= data[i].value
                        }if(data[i].type=="time_alarm"){
                            this.config.time_alarm= data[i].value
                        }if(data[i].type=="time_blink"){
                            this.config.time_blink= data[i].value
                        }
                    }
                });
            },
            sendConfig(e){
                e.preventDefault();
                this.axios.post(this.pathServerApi+"/config",this.config)
                .then(function(res){
                    console.log(res);
                })
            }
        }

    }
</script>
<style scoped>
    .form-inline{
        margin: 10px 0px;
    }
</style>