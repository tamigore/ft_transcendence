
<!-- <template>
    <div>Is ingame ? {{ inGame }}</div>
    <MatchMaking />
    <PongGame />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PongGame from '@/components/PongGame.vue';
import store from "@/store";
import MatchMaking from '@/components/MatchMaking.vue';
import socket from "@/utils/gameSocket";

export default defineComponent({
    name: "PongView",
    components: {
        PongGame,
        MatchMaking,
    },
    mounted() {
        socket.connect();
        store.commit("setGameConnect", true);
    },
    unmounted() {
        socket.disconnect();
        store.commit("setGameConnect", false);
    },
    data() {
        return {
            inGame: store.state.ingame as boolean,
        }
    },
    updated() {
        this.inGame = store.state.ingame;
        if (this.inGame) {
            socket.connect();
        }
        else {
            socket.disconnect();
        }
    },
})

</script> -->



<template>
	<div>Is ingame ? {{ inGame }}</div>
	<MatchMaking />
	<PongGame />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PongGame from '@/components/PongGame.vue';
import store from "@/store";
import MatchMaking from '@/components/MatchMaking.vue';
import socket from "@/utils/gameSocket";

export default defineComponent({
	name: "PongView",
	components: {
		PongGame,
		MatchMaking,
	},
	data() {
		return {
			inGame: store.state.ingame as boolean,
		}
	},
	updated() {
		this.inGame = store.state.ingame;
        
		// if (this.inGame) {
		// 	socket.connect();
        //     store.commit("setGameConnect", true);
		// }
		// else {
		// 	socket.disconnect();
		// }
	},
    onMonted() {

        socket.connect();
        store.commit("setGameConnect", true);
    },
})

</script>