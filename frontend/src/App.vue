<template>
  <div class="flex-item">
    <Log />
  </div>
  <div class="flex-item">
    <ConnectionState />
  </div>
  <div class="flex-item">
    <ConnectionManager />
  </div>
  <div class="flex-item">
    <InputChat />
  </div>
  <div class="container" v-if="isLogged()">
    <div class="flex-item">
      <MessagesDisplay />
    </div>
    <div class="flex-item">
      <PongGame />
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
// import MessagesDisplay from './components/MessagesDisplay.vue';
// import PongGame from './components/PongGame.vue';
import Log from './components/Log.vue';
import ConnectionState from './components/ConnectionState.vue';
import ConnectionManager from './components/ConnectionManager.vue';
import InputChat from './components/Chat.vue';
// import router from '@/router';
import store from '@/store';
// import axios from 'axios';
// import { sessionStorage, useSessionStorage } from "vue-composable";


export default defineComponent({
  components: {
    // MessagesDisplay,
    // PongGame,
    Log,
    ConnectionState,
    ConnectionManager,
    InputChat
  },

  methods : {
    isLogged : () => { 
      return store.state.isLoggedIn
    },
    
    is2F: () => {
      return store.state.user.isTwoFactorAuthentificationEnabled === false ||
      (store.state.user.isTwoFactorAuthentificationEnabled === true && store.state.isEnterCode === true);
    }
  },

  created() {
    const store_item = sessionStorage.getItem('store');
    if (store_item) {
      store.replaceState(Object.assign({}, store.state, JSON.parse(store_item)));
    }
    window.addEventListener('beforeunload', () => { sessionStorage.setItem('store', JSON.stringify(store.state)); });
    console.log("CREATED");
  },

	mounted: function() {
    console.log("MOUNTED");
	}
});
</script>
