<template>
  <div class="myBackground h-screen w-screen">
    <nav v-if="isLogged()">
      <div id="menuU" class="user-menu">
        <Menubar :model="items" class="p-menubar">
          <template #start>
            <img alt="logo" :src="require(`@/assets/pong.png`)" height="40" class="mr-2" />
          </template>
          <template #itemicon>
            <i class="pi pi-fw pi-user"></i>
          </template>
          <template #end>
            <InputText placeholder="Search" type="text" />
          </template>
        </Menubar>
      </div>
    </nav>
    <div>
      <Slide>
        <InputChat />
      </Slide>
    </div>
    <div>
      <router-view />
    </div>
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
.menu-utilisateur {
  /* background-color: lightgrey; */
  height: 6rem;
 }

.p-menubar {
  /* background-color: lightgrey; */
  padding: 1rem;
  height: 6rem;
}

 .p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link {
  padding: 0.5rem 1rem !important;
 }

 .p-menubar .p-menuitem-link {
  padding: 0.5rem 0.5rem !important;
 }
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import InputChat from './components/Chat.vue';
import store from '@/store';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { server } from "@/helper";
import router from './router';
import { Slide } from "vue3-burger-menu"

export default defineComponent({
  components: {
    Slide,
    InputChat,
  },
  data() {
    return {
      items : ref([
        {
          label: 'Users',
          icon: 'pi pi-fw pi-user',
          items: [
            {
              label: 'Logout',
              icon: 'pi pi-fw pi-user-plus',
              command: () => {
                this.LogoutPost();
              },
            },
            {
              label: 'Search',
              icon: 'pi pi-fw pi-users',
              items: [
                {
                  label: 'Filter',
                  icon: 'pi pi-fw pi-filter',
                  items: [
                    {
                      label: 'Print',
                      icon: 'pi pi-fw pi-print'
                    }
                  ]
                },
                {
                  icon: 'pi pi-fw pi-bars',
                  label: 'List'
                }
              ]
            }
          ]
        },
        {
            label: 'Pong',
            icon: 'https://primefaces.org/cdn/primevue/images/dock/finder.svg',
            command: () => {
              router.push("/pong");
            },
        },
        {
            label: 'History',
            icon: 'https://primefaces.org/cdn/primevue/images/dock/appstore.svg',
            command: () => {
              router.push("/history");// same as router.push({ name: history })
            },
        },
        {
            label: 'Profile',
            icon: 'https://primefaces.org/cdn/primevue/images/dock/photos.svg',
            command: () => {
              router.push("/profile");
            },
        },
        {
          label: 'Quit',
          icon: 'pi pi-fw pi-power-off',
          command: () => {
            this.LogoutPost();
          }
        },
      ]),
    };
  },
  methods : {
    async LogoutPost() {
        axios.defaults.baseURL = server.nestUrl;
        await axios.post("api/auth/logout", {}, {
          timeout: 1000,
          headers: {"Authorization": `Bearer ${store.state.user.hash}`}
        })
        .then((response: AxiosResponse) => {
          console.log(response)
          store.commit("setHash", "");
          store.commit("setHashRT", "");
          store.commit("setLogged", false);
        })
        .catch((error: AxiosError) => {
          console.log(error)
          throw new Error("Logout failed: " + error);
        })
        store.commit("setUsername", "");
        router.push("/");
    },
    isLogged : () => { 
      return store.state.user.logged;
    },
  },
  created() {
    const store_item = sessionStorage.getItem('store');
    if (store_item) {
      store.replaceState(Object.assign({}, store.state, JSON.parse(store_item)));
    }
    window.addEventListener('beforeunload', () => { sessionStorage.setItem('store', JSON.stringify(store.state)); });
    console.log("APP CREATED");
  },
});
</script>
