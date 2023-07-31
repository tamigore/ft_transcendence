<template>
  <div class="myBackground h-screen w-screen">
    <nav v-if="isLogged()">
      <div id="menuU" class="user-menu">
        <Menubar :model="items" class="p-menubar">
          <template #start>
            <img alt="logo" :src="require(`@/assets/pong.png`)" height="40" class="mr-2" />
          </template>
        </Menubar>
      </div>
    </nav>
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

/* menu bar for navigation */
.menu-utilisateur {
  height: 6rem;
}
.p-menubar {
  padding: 1rem;
  height: 6rem;
}
.p-menubar .p-menubar-root-list > .p-menuitem > .p-menuitem-link {
  padding: 0.5rem 1rem !important;
}
.p-menubar .p-menuitem-link {
  padding: 0.5rem 0.5rem !important;
}

/* burger menu for chat */
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
  height: 100vh; /* 100% Full-height */
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
import store from '@/store';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { server } from "@/utils/helper";
import router from './router';
import { useToast } from 'primevue/usetoast';

export default defineComponent({
  components: {
  },
  data() {
    return {
      items : ref([
        {
            label: 'Pong',
            icon: 'pi pi-circle-fill',
            command: () => {
              router.push("/pong");
            },
        },
        {
            label: 'Chat',
            icon: 'pi pi-comment',
            command: () => {
              router.push("/chat");// same as router.push({ name: history })
            },
        },
        {
            label: 'Profile',
            icon: 'pi pi-file',
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
      toast: useToast(),
    };
  },
  mounted() {
    console.log("APP mounted");
  },
  methods : {
    async LogoutPost() {
        axios.defaults.baseURL = server.nestUrl;
        await axios.post("api/auth/logout", {}, {
          headers: {"Authorization": `Bearer ${store.state.user.hash}`}
        })
        .then((response: AxiosResponse) => {
          console.log("App LogoutPost response: ", response);
          store.commit("setHash", "");
          store.commit("setHashRt", "");
          store.commit("setLogged", false);
          store.commit("setUsername", "");
          store.commit("delUser");
        })
        .catch((error: AxiosError) => {
          console.log("App LogoutPost error: ", error);
          throw new Error("Logout failed: " + error);
        })
        router.push("/");
    },
    isLogged : () => { 
      return store.state.user.loggedIn;
    },
  },
  created() {
    console.log("APP CREATED");
    const store_item = sessionStorage.getItem('store');
    if (store_item) {
      store.replaceState(Object.assign({}, store.state, JSON.parse(store_item)));
    }
    window.addEventListener('beforeunload', () => { sessionStorage.setItem('store', JSON.stringify(store.state));});
  },
  unmounted() {
    console.log("App unmounted, user is log ? ", store.state.user.loggedIn);
  },
});
</script>
