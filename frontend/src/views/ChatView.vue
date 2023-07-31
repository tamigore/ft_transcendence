<template>
	<ChatDisplay/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChatDisplay from '@/components/ChatDisplay.vue';

export default defineComponent ({
	components: {
		ChatDisplay,
	},
});
</script>
