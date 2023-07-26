
<template>
	<PongGame />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PongGame from '@/components/PongGame.vue';

export default defineComponent({
    name: "PongView",
	components: {
		PongGame
	},
})

</script>