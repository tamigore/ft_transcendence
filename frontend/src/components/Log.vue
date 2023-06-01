<template>
    <section class="thead-bg">
        <div class="fetch-profile">
            <div class="fetch-profile" v-if="!isLogged()">
                <div>
                    <input v-model="email" placeholder="Email" class="btn-users">
                    <input v-model="password" placeholder="Password" class="btn-users">
                </div>
                <div>
                    <button @click="SignUpPost" class="btn-users">SignUp</button>
                    <button @click="SignInPost" class="btn-users">SignIn</button>
                </div>
            </div>
            <div class="fetch-profile" v-else>
                <button @click="LogoutPost" class="btn-users">Logout</button>
            </div>
            <!-- <button @click="RefreshPost" class="btn-users">Refresh</button> -->
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import store from '@/store';
import { server } from "@/helper"

declare interface User {
    id: string,
    login42: string,
    avatar42: string,
    wins: number,
    losses: number,
    total_games: number,
    score: number,
    ladderpos: number,
    status: string,
    isTwoFactorAuthentificationEnabled: false,
    access_token: string,
    refresh_token: string,
    username: string,
    avatarId: string,
    watchGame: string,
}

export default defineComponent ({
  name: "GetPage",
  
  data() {
    return {
      users: new Array<User>(),
      loading: false,
      email: '',
      password: '',
      AccessToken: '',
      RefreshToken: ''
    };
  },

  methods: {

    async SignUpPost() {
        axios.defaults.baseURL = server.baseUrl;
        const result = await axios.post('/api/auth/local/signup', {
            email: this.email,
            password: this.email,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((response) => {
            console.log(response);
            this.AccessToken = response.data.access_token;
            this.RefreshToken = response.data.refresh_token;
            store.commit('isLogged', true);
            console.log(store.state.isLoggedIn) // -> 1   
        })
        .catch((error) => {
            console.log(error)
        })
        this.email = '';
        this.password = '';
    },

    isLogged : () => { 
      return store.state.isLoggedIn
    },

    async SignInPost() {
        axios.defaults.baseURL = server.baseUrl;
        const result = await axios.post('/api/auth/local/signin', {
            email: this.email,
            password: this.email,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((response) => {
            console.log(response);
            this.AccessToken = response.data.access_token;
            this.RefreshToken = response.data.refresh_token;
            store.commit('isLogged', true);
            console.log(store.state.isLoggedIn) // -> 1
        })
        .catch((error) => {
            console.log(error)
        })
        this.email = '';
        this.password = '';
        console.log(result);
    },

    async LogoutPost() {
        axios.defaults.baseURL = server.baseUrl;
        await axios.post('api/auth/logout', {}, {
            timeout: 1000,
            headers: {'Authorization': `Bearer ${this.AccessToken}`}
        })
        .then((response) => {
            console.log(response)
            this.AccessToken = '';
            this.RefreshToken = '';
            store.commit('isLogged', false);
            console.log(store.state.isLoggedIn) // -> 0
        })
        .catch((error) => {
            console.log(error)
            console.log(store.state.isLoggedIn) // -> 0
        })
    },

    async RefreshPost() {
        axios.defaults.baseURL = server.baseUrl;
        await axios.post('/api/auth/refresh', {}, {
            timeout: 1000,
            headers: {'Authorization': `Bearer ${this.AccessToken}`}
        })
        .then((response) => {
            console.log(response)
            this.AccessToken = response.data.access_token;
            this.RefreshToken = response.data.refresh_token;
        })
        .catch((error) => {
            console.log(error)
        })
    }
  },
});
</script>

<style>
.fetch-profile {
    display: flex;
    justify-content: center;
    width: 90%;
    padding: 30px;
}

.fetch-profile {
    display: flex;
    justify-content: center;
    width: 90%;
    padding: 30px;
}

.thead-bg {
    background-color: rgb(221, 220, 220);
}

.btn-users {
    background-color: #000;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}

/* Popup container */
.popup {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

/* The actual popup (appears on top) */
.popup .popuptext {
  visibility: hidden;
  width: 160px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 0;
  position: relative;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -80px;
}

/* Popup arrow */
.popup .popuptext::after {
  content: "";
  position: relative;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Toggle this class when clicking on the popup container (hide and show the popup) */
.popup .show {
  visibility: visible;
  -webkit-animation: fadeIn 1s;
  animation: fadeIn 1s
}

/* Add animation (fade in the popup) */
@-webkit-keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity:1 ;}
}
</style>




