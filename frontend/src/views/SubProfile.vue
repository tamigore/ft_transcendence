<template>
  <Accordion :activeIndex="0">
    <AccordionTab>
      <div class="surface-section border-round box-shadow" style="padding: 5em;">
        <div class="grid-container">
          <div class="p-card p-component card" style="background-color: rgb(69, 60, 73); width: 29em;">
            <div class="p-card-body">
              <div class="selected-image" style="background-color: rgb(37, 37, 37);">
                <img :src="selectedImage.img" :alt="'Image ' + selectedImage.id" />
              </div>
            </div>
          </div>

          <div class="profile-details">
            <ul class="list-none p-0 m-0">
              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="font-medium text-3xl text-900 w-6 md:w-2">
                  <span v-if="userData">{{ userData.username }}'s profile</span>
                </div>
                <div class="text-900 w-6 md:w-2 font-medium"></div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Username</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                  <span v-if="userData">{{ userData.username }}</span>
                </div>
                <div class="w-6 md:w-2 flex justify-content-end"></div>
              </li>

              <li class="flex align-items-center py-5 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Id</div>
                <div class="text-900 w-full md:w-8 md:flex-order-1 flex-order-1">
                  <Chip><span v-if="userData">{{ userData.id }}</span></Chip>
                </div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Email</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 text-justify">
                  <span v-if="userData">{{ userData.email }}</span>
                </div>
                <div class="w-6 md:w-2 flex justify-content-end"></div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Bio</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-grow-1 text-justify">
                  <span v-if="userData">{{ userData.bio }}</span>
                </div>
                <div class="w-4 md:w-2 flex justify-content-end"></div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AccordionTab>
  </Accordion>
</template>


<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';
import { server } from "@/utils/helper";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { User } from '@/utils/interfaces';
import { useRoute } from "vue-router";


export default defineComponent({
name: 'SubProfile',
computed: {
selectedImage() {
  const selectedId = store.state.user.img;
  return this.getImageById(selectedId) || { id: 1, img: require('@/assets/welc.jpeg') };
},
},
async mounted() {
    await this.getUserByUsername();
  },
data() {
  return {
    userData: null as User | null,
    storedUsername: '',
    imageGrid: [
      { id: "1", img: require('@/assets/profiles/profil_1.jpg') },
      { id: "2", img: require('@/assets/profiles/profil_2.jpg') },
      { id: "3", img: require('@/assets/profiles/profil_3.jpg') },
      { id: "4", img: require('@/assets/profiles/profil_4.jpg') },
      { id: "5", img: require('@/assets/profiles/profil_5.jpg') },
      { id: "6", img: require('@/assets/profiles/profil_6.jpg') },
      { id: "7", img: require('@/assets/profiles/profil_7.jpg') },
      { id: "8", img: require('@/assets/profiles/profil_8.jpg') },
      { id: "9", img: require('@/assets/profiles/profil_9.jpg') },
    ],
  }
},
methods: 
{
  getImageById(id: string | null) {
    if (!id) return null;
    return this.imageGrid.find(image => image.id === id);
  },

  async getUserByUsername() {
    const route = useRoute();
    const username = route.params.username;
    console.log(username);
    axios.defaults.baseURL = server.nestUrl;
    return axios
    .get(`/api/user/username/${username}`, {
      headers: { Authorization: `Bearer ${store.state.user.hash}` },
    })
    .then((response: AxiosResponse) => {
      console.log(response);
      this.userData = response.data as User;
    })
    .catch((error: AxiosError) => {
      console.error(error);
    });
  },
},
})
</script>


<style scoped>


.selected-image {
  cursor: pointer;
z-index: 1;
}

.selected-image.active {
  border: 2px solid #000;
}

.grid-container {
display: grid;
grid-template-columns: 32em;
grid-gap: 1em;
}

.card {
grid-column: 1;
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
grid-column: 2;
}

</style>