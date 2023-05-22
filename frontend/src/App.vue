<template>

  <div class="container">
    <div class="flex-item">
      <MessagesDisplay />
    </div>
    <div class="flex-item">
      <PongGame />
    </div>
	<div class="flex-item">
      <User />
    </div>
  </div>
  
</template>

<style>
.container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.flex-item {
  flex: 1;
}
</style>


<script lang="ts">
import { defineComponent } from 'vue';
import MessagesDisplay from './components/MessagesDisplay.vue';
import PongGame from './components/PongGame.vue';
import User from './user/User.vue';

export default defineComponent({
  components: {
    MessagesDisplay,
    PongGame,
	User
  },
});
</script>
