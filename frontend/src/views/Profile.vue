<template>

      <div v-if="showPopup">
        <div class="popup border-round box-shadow">
          <h2 class="popup-title">Choisir un avatar</h2>
          <div class="image-grid">
            <div v-for="image in imageGrid" :key="image.id" @click="selectImage(image)">
              <div class="image-frame">
                <img :src="image.img" :alt="'Image ' + image.id" />
              </div>
            </div>
          </div>
        </div>
      </div>
    
    <div class="surface-section border-round box-shadow">
      <div class="grid-container">
        <div class="p-card p-component card" style="width: 29em;"><!---->
          <div class="p-card-body">
            <div @click="openImagePicker" class="selected-image" :class="{ active: showPopup }">
              <img :src="selectedImage.img" :alt="'Image ' + selectedImage.id" type="pointer"/>
            </div>
          </div>
        </div>
        
        <div class="profile-details">
        <div class="font-medium text-3xl text-900 mb-3">Profile</div>

        <ul class="list-none p-0 m-0">
          
          <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
            <div class="text-500 w-6 md:w-2 font-medium">Username</div>
            <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              <span v-if="!isEditingUsername">{{ username }}</span>
              <input v-else type="text" v-model="editedUsername" @keyup.enter="ModifyUserUsername" />
            </div>
            <div class="w-6 md:w-2 flex justify-content-end">
              <button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserUsername">
                {{ isEditingUsername ? (isSavingUsername ? 'Saving...' : 'Save') : 'Edit' }}
              </button>
            </div>
          </li>
          
          <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
            <div class="text-500 w-6 md:w-2 font-medium">Email</div>
            <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              <span v-if="!isEditingEmail">{{ email }}</span>
              <input v-else type="text" v-model="editedEmail" @keyup.enter="ModifyUserEmail" />
            </div>
            <div class="w-6 md:w-2 flex justify-content-end">
              <button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserEmail">
                {{ isEditingEmail ? (isSavingEmail ? 'Saving...' : 'Save') : 'Edit' }}
              </button>
            </div>
          </li>
          
          <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
            <div class="text-500 w-6 md:w-2 font-medium">Last game</div>
            <div class="text-900 w-full md:w-8 md:flex-order-1 flex-order-1">
              <Chip label="God Tiers"></Chip>
            </div>
          </li>

                    
          <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
            <div class="text-500 w-6 md:w-2 font-medium">Titles</div>
            <div class="text-900 w-full md:w-8 md:flex-order-1 flex-order-1">
              <Chip label="Challenger" class="mr-2"></Chip>
              <Chip label="No 1" class="mr-2"></Chip>
              <Chip label="God Tiers"></Chip>
            </div>
          </li>
          
          <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
            <div class="text-500 w-6 md:w-2 font-medium">Description</div>
            <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              <span v-if="!isEditingDescription">{{ description }}</span>
              <input v-else type="text" v-model="editedDescription" @keyup.enter="ModifyUserDescription" />
            </div>
            <div class="w-6 md:w-2 flex justify-content-end">
              <button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserDescription">
                {{ isEditingDescription ? (isSavingDescription ? 'Saving...' : 'Save') : 'Edit' }}
              </button>
            </div>
          </li>

        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';
import { server } from "@/utils/helper";
import axios, { AxiosResponse, AxiosError } from 'axios';

export default defineComponent({
  name: 'ProfileView',
  computed: {
    selectedImage() {
      const selectedId = store.state.user.avatar;
      return this.getImageById(selectedId) || { id: 1, img: require('@/assets/welc.jpeg') };
    },
    username() {
      return store.state.user.username;
    },
    email() {
      return store.state.user.email;
    },
    description() {
      return store.state.user.description;
    },
  },
  data() {
    return {      
      isEditingEmail: false,
      isSavingEmail: false,
      editedEmail: "",
      
      isEditingDescription: false,
      isSavingDescription: false,
      editedDescription: "", 
      
      isEditingUsername: false,
      isSavingUsername: false,
      editedUsername: "",
      
      showPopup: false,
      imageGrid: [
        { id: 1, img: require('@/assets/profiles/profil_1.jpg') },
        { id: 2, img: require('@/assets/profiles/profil_2.jpg') },
        { id: 3, img: require('@/assets/profiles/profil_3.jpg') },
        { id: 4, img: require('@/assets/profiles/profil_4.jpg') },
        { id: 5, img: require('@/assets/profiles/profil_5.jpg') },
        { id: 6, img: require('@/assets/profiles/profil_6.jpg') },
        { id: 7, img: require('@/assets/profiles/profil_7.jpg') },
        { id: 8, img: require('@/assets/profiles/profil_8.jpg') },
        { id: 9, img: require('@/assets/profiles/profil_9.jpg') },
      ],
    }
  },
  methods: 
  {
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
    async ModifyUserDescription() 
    {
      if (this.isEditingDescription) 
      {
        this.ModifyStoreDescription();
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/modify', 
        {
            description: this.email,
            cmd : "description",
            value : this.editedDescription,
        })
        .then((response: AxiosResponse) => 
        {
            console.log(response);
        })
        .catch((error: AxiosError) => 
        {
            console.log(error);
        })

        this.isSavingDescription = false; // Mettre à jour l'état du bouton après la requête
      }
      this.isEditingDescription = !this.isEditingDescription;
    },

    async ModifyUserEmail() 
    {
      if (this.isEditingEmail) 
      {
        this.ModifyStoreEmail();
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/modify', 
        {
            email: this.email,
            cmd : "email",
            value : this.editedEmail,
        })
        .then((response: AxiosResponse) => 
        {
            console.log(response);
        })
        .catch((error: AxiosError) => 
        {
            console.log(error);
        })
        this.isSavingEmail = false;
      }
      this.isEditingEmail = !this.isEditingEmail;
    },

    async ModifyUserUsername() 
    {
      if (this.isEditingUsername) 
      {
        this.ModifyStoreUsername();
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/modify', {
            email: this.email,
            cmd : "username",
            value : this.editedUsername,
        })
        .then((response: AxiosResponse) => {
            console.log(response);
        })
        .catch((error: AxiosError) => {
            console.log(error);
        })
        this.isSavingUsername = false;
      }
      this.isEditingUsername = !this.isEditingUsername;
    },
    ModifyStoreUsername() {
      store.commit('setUsername', this.editedUsername);
    },
    ModifyStoreEmail() {
      store.commit('setEmail', this.editedEmail);
    },
    ModifyStoreAvatar() {
      store.commit('setAvatar', this.avatarPath);
    },
    ModifyStoreDescription() {
      store.commit('setDescription', this.editedDescription);
    },
  }
})
</script>


<style scoped>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #49354f;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  z-index: 2;
}

  .popup-title {
    color: #000;
    font-size: 2rem;
    font-style: italic;
    font-family:Verdana, Geneva, Tahoma, sans-serif;
    text-align: left;
    padding-bottom: 0.3cm;
  }
  
  .image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .image-frame {
    width: 200px; /* Largeur de 300 pixels pour le cadre */
    height: 200px; /* Hauteur de 300 pixels pour le cadre */
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
  z-index: 1; /* Ajoutez cette ligne pour définir le z-index à 1 */
}
  
  .selected-image.active {
    border: 2px solid #000;
  }

.grid-container {
  display: grid;
  grid-template-columns: 32em; /* Répartit l'espace en deux colonnes, la première pour la carte et la deuxième pour les détails du profil */
  grid-gap: 1em;
}

.card {
  grid-column: 1; /* Place la carte dans la première colonne */
}

.selected-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.selected-image img {
  width: 500px;
  height: 500px;
  border-radius: 50%;
  object-fit: cover;
  padding: 30px;
}

.profile-details {
  grid-column: 2; /* Place les détails du profil dans la deuxième colonne */
}

.p-button-text {
  color: #000;
}

.myBackground {
  background:
  linear-gradient( #290526, transparent),
  linear-gradient(to top left, #2e081f, transparent),
  linear-gradient(to top right, #1e1546, transparent),
  linear-gradient(to left, #00000000, #19032583);
  background-blend-mode: screen;
}
</style>
