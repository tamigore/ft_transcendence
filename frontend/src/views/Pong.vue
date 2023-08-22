
<template>
  <!-- <CanvasGame /> -->
  <MatchMaking />
  <PongGame />
</template>

<script type="ts">
// import CanvasGame from "@/components/CanvasGame";
import PongGame from "@/components/PongGame";
import MatchMaking from "@/components/MatchMaking.vue";

export default {
  name: "PongVue",
  components: {
    // CanvasGame,
    MatchMaking,
    PongGame,
  },
}
</script>