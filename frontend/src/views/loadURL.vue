<template>
  <div>
    <label for="imageUrl">Entrez l'URL de l'image :</label>
    <input type="text" v-model="imageUrl" id="imageUrl" />
    <button @click="chargerImage">Charger l'image</button>
    <img v-if="loadedImage" :src="loadedImage" alt="Image chargée" />
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
      imageUrl: '',
      loadedImage: '',
    };
  },
  methods: {
    async chargerImage() {
      this.loadedImage = '';

      if (this.imageUrl) {
        if (await this.estUrlImageValide(this.imageUrl)) {
          this.loadedImage = this.imageUrl;
          this.imageUrl = '';

          store.commit('setAvatarId', this.imageUrl);
        } else {
          alert('invalid URL');
          this.imageUrl = '';
        }
      }
    },
    async estUrlImageValide(url: string) {
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
