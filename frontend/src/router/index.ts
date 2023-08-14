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
  if (from.name === 'pong') {
    console.log('leaving pong: if game not finished user lose');
  }
  if (from.name === 'home') {
    await axios.get(`api/user/${store.state.user.id}`, {
      headers: {"Authorization": `Bearer ${store.state.user.hash}`}
    })
    .then((response: AxiosResponse) => {
      console.log(response);
      store.commit("setUser", response.data);
      if (!socket.connected) {
        socket.connect();
        store.commit("setChatSocket", socket.id);
      }
    })
    .catch((error: AxiosError) => {
      console.log(error)
      throw new Error("router get user failed: " + error);
    })
  }
  if (
    !store.state.user.loggedIn &&
    to.name !== 'home'
  ) {
    return { path: '/' };
  }
})

export default router
