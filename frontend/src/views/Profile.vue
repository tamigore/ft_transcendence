<template>
  <div class="surface-section border-round box-shadow">
    <div class="grid-container">
      <div class="p-card p-component card" style="width: 29em;"><!---->
        <div class="p-card-body">
            <div class="image-container">
              <img :src="avatar" :alt="Email" @click="openFile" style="cursor: pointer" />
            </div>
        </div>
      </div>
      <input ref="fileInput" type="file" style="display: none" @change="loadAvatar" />

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
    avatar() {
      return require(`@/assets/${this.avatarPath}`);
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
      
      avatarPath : "neon-SignUp-ping-pong.jpg",
    }
  },
  methods: 
  {

    openFile(): void 
    {
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    loadAvatar(event: Event): void {

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
      this.avatar = e.target ? e.target.result as string : '';
    };
    reader.readAsDataURL(file);
    this.avatarPath = file.name;
  }
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
        this.email = "cocorico";
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
        this.isSavingEmail = false; // Mettre à jour l'état du bouton après la requête
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
        this.isSavingUsername = false; // Mettre à jour l'état du bouton après la requête
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


<style>

.grid-container {
  display: grid;
  grid-template-columns: 32em; /* Répartit l'espace en deux colonnes, la première pour la carte et la deuxième pour les détails du profil */
  grid-gap: 1em;
}

.card {
  grid-column: 1; /* Place la carte dans la première colonne */
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-container img {
  width: 500px;
  height: 500px;
  border-radius: 50%;
  object-fit: cover;
  padding: 30px;
}

.profile-details {
  grid-column: 2; /* Place les détails du profil dans la deuxième colonne */
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




<!-- <template>
  <div class="surface-section">
    <div class="font-medium text-3xl text-900 mb-3">Profile</div>
    <div class="text-500 mb-5" style="">{{ Email }}</div>
    <ul class="list-none p-0 m-0">
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Email</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{{ email }}</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>


      <li class="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Description</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 line-height-3">
            A group of professional bank robbers start to feel the heat from police
            when they unknowingly leave a clue at their latest heist.</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style>
.myBackground {
  background:
        linear-gradient( #290526, transparent),
        linear-gradient(to top left, #2e081f, transparent),
        linear-gradient(to top right, #1e1546, transparent),
        linear-gradient(to left, #00000000, #19032583);
  background-blend-mode: screen;
}
</style>

<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';
import { server } from "@/helper"
import axios, { AxiosResponse, AxiosError } from 'axios';

export default defineComponent ({
  name: 'ProfileView',
  data() {
    return {
      login42: "",
      avatar42: "",
      Email: store.state.user.Email,
      email: store.state.user.email,
      avatar: store.state.user.avatar,
    }
  },
  methods: {
    async ModifUser() {
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/modify', {
            email: this.email,
            cmd : "",
            value : "",
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((response: AxiosResponse) => {
            console.log(response);
        })
        .catch((error: AxiosError) => {
            console.log(error);
        })
    },
  }
})
</script> -->