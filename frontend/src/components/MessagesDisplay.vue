<template>
    <div class="container">
        
        <input v-model="inputString" type="text" placeholder="Enter a string" />
        <button @click="displayString">Display</button>
        <div class="messageStack">
        <p v-for="message in messageStack" :key="message">{{ message }}</p>
        </div>
</div>
</template>

<script lang="ts">
import { defineComponent,onMounted, ref, computed } from 'vue';


export default defineComponent({
data() {
	return {
	inputString: '',
	messageStack: [] as string[],
	};
},
methods: {
	displayString(): void {
    if (this.inputString != '' )
	this.messageStack.push(this.inputString);
	this.inputString = '';
	},
	},
}
);

</script>

<style >
.container {
  text-align: left;
}

.messageStack {
  display: flex;
  flex-direction: column;
  max-height: 120px; /* Set a maximum height for the message stack */
  overflow-y: auto; /* Enable vertical scrolling if the content exceeds the maximum height */
}

.message {
  text-align: center;
}
</style>