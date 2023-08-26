<template>
  <div v-if="!inGame && !inSolo">
    <MatchMaking />
  </div>
    <PongGame />
</template>

<script type="ts">
import PongGame from "@/components/PongGame";
import MatchMaking from "@/components/MatchMaking.vue";
import store from "@/store";

export default {
  name: "PongVue",
  components: {
    MatchMaking,
    PongGame,
  },
  computed: {
    inGame() {
      return store.state.ingame;
    },
	inSolo() {
      return store.state.insolo;
    },
		inQueue() {
      return store.state.inQueue;
    }
  }
}
</script>
