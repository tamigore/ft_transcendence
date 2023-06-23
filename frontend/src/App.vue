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
    <Slide>
      <InputChat />
    </Slide>
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

.bm-burger-button {
  position: fixed;
  width: 36px;
  height: 30px;
  left: 36px;
  top: 36px;
  cursor: pointer;
}
.bm-burger-bars {
  background-color: #373a47;
}
.line-style {
  position: absolute;
  height: 20%;
  left: 0;
  right: 0;
}
.cross-style {
  position: absolute;
  top: 12px;
  right: 2px;
  cursor: pointer;
}
.bm-cross {
  background: #bdc3c7;
}
.bm-cross-button {
  height: 24px;
  width: 24px;
}
.bm-menu {
  height: 100%; /* 100% Full-height */
  width: 0; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1000; /* Stay on top */
  top: 0;
  left: 0;
  background-color: linear-gradient(to top, #1e1546, #290526),; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 60px; /* Place content 60px from the top */
  transition: 0.5s; /*0.5 second transition effect to slide in the sidenav*/
}

.bm-overlay {
  background: rgba(0, 0, 0, 0.3);
}
.bm-item-list {
  color: #b8b7ad;
  margin-left: 10%;
  font-size: 20px;
}
.bm-item-list > * {
  display: flex;
  text-decoration: none;
  padding: 0.7em;
}
.bm-item-list > * > span {
  margin-left: 10px;
  font-weight: 700;
  color: white;
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
              router.push('/profile');
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
