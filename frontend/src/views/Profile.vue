<template>
  <div class="surface-section">
    <div class="font-medium text-3xl text-900 mb-3">Profile</div>
    <div class="text-500 mb-5">{{ username }}</div>
    <ul class="list-none p-0 m-0">
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Email</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{{ email }}</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Titles</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
          <Chip label="Challenger" class="mr-2"></Chip>
          <Chip label="No 1" class="mr-2"></Chip>
          <Chip label="God Tiers"></Chip>
        </div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">History</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">Last Game</div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Avatar</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{{ avatar }}</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>
      </li>
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

export default defineComponent ({
  name: 'ProfileView',
  data() {
    return {
      login42: "",
      avatar42: "",
      username: store.state.user.username,
      email: store.state.user.email,
      avatar: store.state.user.avatar,
    }
  },
  methods: {
  }
})
</script>

<!-- <template>
  <div class="surface-section">
    <div class="font-medium text-3xl text-900 mb-3">Profile</div>
    <div class="text-500 mb-5" style="">{{ username }}</div>
    <ul class="list-none p-0 m-0">
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Email</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{{ email }}</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Titles</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
          <Chip label="Challenger" class="mr-2"></Chip>
          <Chip label="No 1" class="mr-2"></Chip>
          <Chip label="God Tiers"></Chip>
        </div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">History</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">Last Game</div>
      </li>
      <li class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
        <div class="text-500 w-6 md:w-2 font-medium">Avatar</div>
        <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{{ avatar }}</div>
        <div class="w-6 md:w-2 flex justify-content-end">
          <Button @click="ModifUser" label="Edit" icon="pi pi-pencil" class="p-button-text"></Button>
        </div>
      </li>
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
      username: store.state.user.username,
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