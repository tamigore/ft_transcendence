import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Profile from '@/views/Profile.vue';
import SubProfile from '@/views/SubProfile.vue';
import Error404 from '@/views/Error404.vue';
import Pong from '@/views/Pong.vue';
import Chat from '@/views/ChatView.vue';
import store from '@/store';
import axios, { AxiosResponse, AxiosError } from 'axios';
import socket from "@/utils/socket";
import { useCookies } from "vue3-cookies";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    props: true
  },
  {
    path: '/profile/:username',
    name: 'sub',
    component: SubProfile,
    props: true
  },
  {
    path: '/404NotFound',
    name: 'ErrorNotFound',
    component: Error404,
  },
  {
    path: '/pong',
    name: 'pong',
    component: Pong
  },
  {
    path: '/chat',
    name: 'chat',
    component: Chat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  console.log(from);
  console.log(to);
  if (typeof from.name === "undefined") {
    const { cookies } = useCookies();
    console.log(cookies.keys());
    const access_token = cookies.get("access_token");
    const refresh_token = cookies.get("refresh_token");
    const userId = cookies.get("userId");
    console.log("cookies userId: " + userId);// + " | " + access_token + " | " + refresh_token);
    if (typeof userId !== 'undefined' && userId && userId.length) {
      store.commit("setHash", access_token);
      store.commit("setHashRt", refresh_token);
      store.commit("setUserID", parseInt(userId));
      cookies.remove("access_token");
      cookies.remove("refresh_token");
      cookies.remove("userId");
      await axios.get(`api/user/all/${store.state.user.id}`, {
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then((response: AxiosResponse) => {
        console.log(response);
        store.commit("setUser", response.data);
        return { path: '/profile' };
      })
      .catch((error: AxiosError) => {
        console.log(error)
        throw new Error("router get user failed: " + error);
      })
    }
  }
  if (from.name === 'home') {
    await axios.get(`api/user/all/${store.state.user.id}`, {
      headers: {"Authorization": `Bearer ${store.state.user.hash}`}
    })
    .then(async (response: AxiosResponse) => {
      console.log(response);
      store.commit("setUser", response.data);
      if (!socket.connected) {
        socket.connect();
        store.commit("setChatSocket", socket.id);
      }
    })
    .catch((error: AxiosError) => {
      console.log(error);
      throw new Error("router get user failed: " + error);
    })
    if (store.state.user.twoFA && store.state.user.twoFA?.length > 0)
    {
      const pwd = prompt("Two factor authentification requiered");
      await axios.post(`api/tfa/authenticate`, { id: store.state.user.id, tfa_code: pwd } ,{
        headers: {"Authorization": `Bearer ${store.state.user.hash}`}
      })
      .then(async (response) => {
        if (!response.data)
        {
          alert("Two factor authentification is false");
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
          return { path: '/' };
        }
      })
      .catch((error) => {
        throw error;
      })
    }
  }
  if (
    !store.state.user.loggedIn &&
    to.name !== 'home'
  ) {
    console.log("user.loggedIn is false");
    return { path: '/' };
  }
})

export default router
