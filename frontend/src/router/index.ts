import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import Profile from '@/views/Profile.vue';
import Pong from '@/views/Pong.vue';
// import NotFound from '@/views/404notFound.vue';
import Chat from '@/views/ChatView.vue';
import store from '@/store';

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
    console.log('leaving pong');
  }
  if (
    !store.state.user.loggedIn &&
    to.name !== 'home'
  ) {
    // redirect the user to the login page
    return { path: '/' };
  }
})

export default router
