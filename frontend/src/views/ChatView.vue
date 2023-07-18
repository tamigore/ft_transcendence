<template>
	<div>
		<ChatDisplay/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import axios, { AxiosResponse, AxiosError } from 'axios';
// import { server } from "@/utils/helper";
// import store from '@/store';
import ChatDisplay from '@/components/ChatDisplay.vue';

export default defineComponent ({
	components: {
    ChatDisplay,
},

	
	methods: {
      
    },
});
</script>

<style lang="scss">

</style>
