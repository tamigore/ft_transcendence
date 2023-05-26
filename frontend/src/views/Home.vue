<template>
  
    <button class='button-loginasguest' @click="createGuest()">Login as a guest</button>
    <p class="welcome"> Welcome to our wonderful transcendence</p>
    <p class="welcome2"> Please choose how to Login</p>
    <div>
      <a class='button-login42' href="https://api.intra.42.fr/oauth/authorize?client_id=a20f591ce8448d5fc7037bd010037bd02b13125eb08ccc5ad6fd0a557f78f953&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauthentification%2Ftest&response_type=code&scope=public&state=01234567899876543210">
                Login with 42
    </a>
  </div>
</template>

<script lang="ts">
import router from '@/router';
import store from '@/store';
import { defineComponent } from 'vue';

export default defineComponent ({
    name: 'HomeView',
    data: function () {
        return {
        login42: '',
        avatar42: '',
        auth42: process.env.VUE_APP_AUTH42,
        }
    },
    mounted: function() { 
            if (store.state.isLoggedIn == true) {
                router.push("/profile");
            return ;
            }
        },
    methods: {
        create42: function () {
            store.dispatch('create42');
        },
        createGuest: function() {
            // Create random name
            let res = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLengh = characters.length;
            for (let i = 0; i < 10; i++)
                res += characters.charAt(Math.floor(Math.random() * charactersLengh));
            const avatar = 'https://cdn.intra.42.fr/users/medium_default.png';


            store.dispatch('createGuest', {
                login42: res,
                avatar42: avatar,
            }).then(function () {
                store.dispatch('loginGuest', {
                login42: res,
                avatar42: avatar,
                }).then(function () {
                router.push('profile');
                }), function () {
                // // // // console.log('ERRRROOOOOR login Guest = ', error);
                }
            }), function () {
                // // // // console.log('ERRRROOOOOR create Guest = ', error);
            }
        }
    }
})
</script>