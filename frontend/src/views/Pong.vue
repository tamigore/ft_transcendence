<template>
  <div v-if="!inGame">
    <MatchMaking />
  </div>
  <div v-else>
    <PongGame />
  </div>
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
    }
  }
}
</script>
