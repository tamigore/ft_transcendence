<template>
  <div>
    <label for="url">URL :</label>
    <input type="text" v-model="url" id="url" />
    <button @click="loadURLImage">Load an avatar</button>
    <img v-if="img" :src="img" alt="Image chargée" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import store from '@/store';

export default defineComponent({
  name: 'ImageLoader',
  data() {
    return {
      url: '',
      img: '',
    };
  },
  methods: {
    async loadURLImage() {
      this.img = '';

      if (this.url) {
        if (await this.isValidURL(this.url)) {
          this.img = this.url;
          this.url = '';

          store.commit('setAvatarId', this.url);
        } else {
          alert('invalid URL');
          this.url = '';
        }
      }
    },
    async isValidURL(url: string) {
      try {
        const response = await axios.head(url);
        return response.status === 200;
      } catch (error) {
        return false;
      }
    },
  },
});
</script>

<style scoped>
</style>
