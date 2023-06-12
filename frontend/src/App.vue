<template>
  <div class="flex-item">
    <Log />
  </div>
  <div class="container" v-if="isLogged()">
    <div class="flex-item">
      <ConnectionState />
    </div>
    <div class="flex-item">
      <ConnectionManager />
    </div>
    <div class="flex-item">
      <InputChat />
    </div>
    <div>
      <BubbleChat />
    </div>
    <div class="flex-item">
      <PongGame />
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.flex-item {
  flex: 1;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import PongGame from './components/PongGame.vue';
import Log from './components/Log.vue';
import ConnectionState from './components/ConnectionState.vue';
import ConnectionManager from './components/ConnectionManager.vue';
import InputChat from './components/Chat.vue';
import BubbleChat from './components/MessagesDisplay.vue';
// import router from '@/router';
import store from '@/store';


export default defineComponent({
  components: {
    PongGame,
    Log,
    ConnectionState,
    ConnectionManager,
    InputChat,
    BubbleChat,
  },
  methods : {
    isLogged : () => { 
      return store.state.user.logged;
    },
  },
  created() {
    // const store_item = sessionStorage.getItem('store');
    // if (store_item) {
    //   store.replaceState(Object.assign({}, store.state, JSON.parse(store_item)));
    // }
    // window.addEventListener('beforeunload', () => { sessionStorage.setItem('store', JSON.stringify(store.state)); });
    // console.log("CREATED");
  },
});
</script>
