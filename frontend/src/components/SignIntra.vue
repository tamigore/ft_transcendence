<template>
    <div class="surface-card p-4 shadow-8 border-round w-full">
      <div class="text-center mb-5">
        <img :src="require(`@/assets/pong.png`)" alt="Image" height="50" class="mb-3">
        <div class="text-900 text-3xl font-medium mb-3">Welcome Back</div>
      </div>
  
      <div>
        <label for="email1" class="block text-900 font-medium mb-2">Email</label>
        <InputText v-model="email" id="email1" type="text" class="w-full mb-3" @keyup.enter="SignInPost()" />
  
        <label for="password1" class="block text-900 font-medium mb-2">Password</label>
        <InputText v-model="password" id="password1" type="password" class="w-full mb-3" @keyup.enter="SignInPost()" />
  
        <div class="flex align-items-center justify-content-between mb-6">
          <div class="flex align-items-center text-indigo-300">
            <Checkbox :binary="true" v-model="checked" class="mr-2"></Checkbox>
            <label>Remember me</label>
          </div>
        </div>
  
        <Button @click="SignInPost()" label="Sign In" icon="pi pi-user" class="w-full"></Button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import store from '@/store';
  
  export default defineComponent ({
    name: "SignIntraCompon",
    data() {
      return {
        email: "",
        password: "",
        checked: false,
      };
    },
    methods: {
      isLogged : () => { 
        return store.state.user.loggedIn;
      },
      async SignInPost() {
        window.location.href = 'efwqfewqfewqfewq';
      },
    },
  });
  </script>