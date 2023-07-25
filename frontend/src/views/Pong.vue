
<template>
	<PongGame />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import store from '@/store';
import PongGame from '@/components/PongGame.vue';
import {}

export default defineComponent({
    name: "PongView",
	components: {
		PongGame
	},
    // data() {
    //     return {
    //         socketio: SocketioGame as typeof SocketioGame,
    //         ingame: false as boolean,
    //     }
    // },
    // mounted() {
    //     this.socketio.setupSocketConnection();
    // },
    // methods: {
    //     onUp() {
    //         this.socketio.socket.emit("up", {user: store.state.user, room: store.state.last_room});
    //     },
	// 	onDown() {
    //         this.socketio.socket.emit("up", {user: store.state.user, room: store.state.last_room});
    //     },
    //     connect() {
    //         this.socketio.socket.connect();
    //     },
    //     disconnect() {
    //         this.socketio.socket.disconnect();
    //     },
    // }
})

</script>