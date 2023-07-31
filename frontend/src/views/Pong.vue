
<template>
	<div>Is ingame ? {{ inGame }}</div>
	<div v-if="inGame">
		<PongGame />
	</div>
	<div v-else>
		<MatchMaking />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PongGame from '@/components/PongGame.vue';
import store from "@/store";
import MatchMaking from '@/components/MatchMaking.vue';

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
	},
})

</script>