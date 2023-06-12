<template>
    <p>Home</p>
</template>

<script lang="ts">
import router from '@/router';
import store from '@/store';
import { defineComponent } from 'vue';

export default defineComponent ({
    name: 'HomeView',
    data() {
            return {
            login42: '',
            avatar42: '',
        }
    },
    mounted() { 
        if (store.state.user.logged == true) {
            router.push("/profile");
        return ;
        }
    },
    methods: {
    }
})
</script>