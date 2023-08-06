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
import store from '@/store'; // Assurez-vous d'importer correctement votre store

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
          this.imageUrl = ''; // Réinitialiser le champ de l'URL

          // Enregistrer l'URL de l'image dans le store
          store.commit('setAvatarId', this.imageUrl);
        } else {
          alert('URL invalide');
          this.imageUrl = ''; // Réinitialiser le champ de l'URL en cas d'erreur
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
/* Vos styles CSS ici */
</style>
