import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Profile from '@/views/Profile.vue';
import Pong from '@/views/Pong.vue';
// import NotFound from '@/views/404notFound.vue';
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
    component: Profile
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
      }
    })
    .catch((error: AxiosError) => {
      console.log(error)
      throw new Error("router get user failed: " + error);
    })
  }
  // if (to.name === 'home' && store.state.user.loggedIn)
  //   console.log("going to home (localhost:8080/) and stil connected...");
  // if (to.name === 'home' && !store.state.user.loggedIn)
  // {
  //   if (socket.connected)
  //   {
  //     console.log("Should not be connected");
  //     socket.disconnect();
  //   }
  //   console.log("going to home (localhost:8080/) and not connected !");
  // }
  if (
    !store.state.user.loggedIn &&
    to.name !== 'home'
  ) {
    // redirect the user to the login page
    return { path: '/' };
  }
})

export default router
