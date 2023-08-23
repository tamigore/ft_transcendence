<template>
  <MatchMaking />
  <PongGame />
</template>

<script type="ts">
import PongGame from "@/components/PongGame";
import MatchMaking from "@/components/MatchMaking.vue";

export default {
  name: "PongVue",
  components: {
    MatchMaking,
    PongGame,
  },
}
</script>
