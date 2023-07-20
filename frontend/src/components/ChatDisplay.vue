<template>
<div class="grid">
    <div class="col-4">
        <div v-for="Room in Rooms" :key="Room.id"  >
            <div >
                <div class= "box-shadow-dark" v-on:click="selectSet(Room.Name)">{{Room.Name}}</div>
            </div>
        </div>
    </div>
    <div class="col box-shadow-dark">
        <div v-for="Room in Rooms" :key="Room.id" >         
            <div v-if="Room.Name == this.selected" >  
                <div v-for="msg in Room.Messages" :key="msg.id" >
                    <div class="box-shadow-dark col-6" :class="{ ' col-offset-6 ': msg.owner == 1}">
                        {{msg.content}}  
                    </div>
                </div>
            </div> 
        </div>
    </div>
    <!-- <div class="grid col box-shadow-dark" v-if="Room.Name == this.selected">
        <div v-for="msg in Room.Messages" :key="msg.id">
            {{ msg.content }}
        </div>
    </div> -->
</div>

</template>

<script lang="ts">
// import SocketioChat from "@/utils/socket";
import { defineComponent } from "vue";
// import store from "@/store";

export default defineComponent({
    name: "ChatDisplay",
    data(){
        
        return{
            Rooms: [
                {
                    Name : "RoomName1",
                    Messages : [
                        {
                            User : 0,
                            username : "tad",
                            owner : 0,
                            content : "salut",
                            date : 1
                        },
                        {
                            User : 0,
                            username : "SeiSeo",
                            owner : 1,
                            content : "t'as finit le webtoon ?",
                            date : 2
                        },
                        
                        {
                            User : 0,
                            username : "tad",
                            owner : 0,
                            content : "non fdp",
                            date : 3
                        },
                    ]
                },
                {
                    Name : "RoomName2",
                    Messages : [
                        {
                            User : 0,
                            username : "SeiSeo",
                            content : "Salutttt ?",
                            date : 1,
                            owner : 1
                        },
                        {
                            User : 1,
                            username : "tad",
                            content : "ftg ?",
                            date : 1,
                            owner : 0
                        }
                    ]
                }
            ],
            selected : ""
        };
    },

    methods: {
        selectSet(value) {
            this.selected = value
            console.log(this.selected);

        }
    }
});
</script>

<style>
body{
    color: white;
}
</style>
