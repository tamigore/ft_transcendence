<template>
  <div>
    <MessagesDisplay />
    <PongGame />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MessagesDisplay from './components/MessagesDisplay.vue';
import PongGame from './components/PongGame.vue';

export default defineComponent({
  components: {
    MessagesDisplay,
    PongGame,
  },
});
</script>
