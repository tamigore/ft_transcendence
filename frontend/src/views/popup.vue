<template>
    <div>
      <div>
        <div @click="openImagePicker" class="selected-image" :class="{ active: showPopup }">
          <h2>Image sélectionnée :</h2>
          <img :src="selectedImage.img" :alt="'Image ' + selectedImage.id" />
        </div>
      </div>
  
      <div v-if="showPopup">
        <div class="popup border-round box-shadow">
          <h2 class="popup-title">Sélectionner un avatar</h2>
          <div class="image-grid">
            <div v-for="image in imageGrid" :key="image.id" @click="selectImage(image)">
              <div class="image-frame">
                <img :src="image.img" :alt="'Image ' + image.id" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import store from '@/store';
  
  export default defineComponent({
    name: 'PopupView',
    data() {
      return {
        // Déclarations des données
        showPopup: false,
        imageGrid: [
          { id: 1, img: require('@/assets/welc.jpeg') },
          { id: 2, img: require('@/assets/welc.jpeg') },
          { id: 3, img: require('@/assets/ping-pong.png') },
          { id: 4, img: require('@/assets/welc.jpeg') },
          { id: 5, img: require('@/assets/ping-pong.png') },
        ],
      };
    },
    computed: {
      selectedImage() {
        const selectedId = store.state.user.avatar;
        return this.getImageById(selectedId) || { id: 1, img: require('@/assets/welc.jpeg') };
      },
    },
    methods: {
      openImagePicker() {
        this.showPopup = true;
      },
      selectImage(image) {
        store.commit('setAvatarId', image.id);
        this.showPopup = false;
      },
      getImageById(id) {
        return this.imageGrid.find(image => image.id === id);
      },
    },
  });
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ccc;
    padding: 40px; /* Ajustez cette valeur pour augmenter la taille du pop-up */
    border: 1px solid #ccc;
    border-radius: 10px; /* Ajout de l'arrondi aux angles du pop-up */
    text-align: center;
  }
  
  .popup-title {
    color: #000;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .image-frame {
    width: 300px; /* Largeur de 300 pixels pour le cadre */
    height: 300px; /* Hauteur de 300 pixels pour le cadre */
    position: relative;
    overflow: hidden;
    background: #000;
  }
  
  .image-frame img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: pointer;
  }
  
  .selected-image {
    cursor: pointer;
  }
  
  .selected-image.active {
    border: 2px solid #000;
  }
  </style>