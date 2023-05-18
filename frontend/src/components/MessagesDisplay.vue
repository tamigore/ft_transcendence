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
    if (this.inputString == '' )
    this.messageStack.push('Please enter a string')
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
  position: absolute; /* Set the container to absolute position */
  top: 0; /* Position the container at the top of its parent */
  left: 1400px;
  display: flex;
}

.messageStack {
  display: flex;
  position: absolute;
  flex-direction: column;
  max-height: 800px; /* Set a maximum height for the message stack */
  width: 380px;
  overflow-y: auto; /* Enable vertical scrolling if the content exceeds the maximum height */
  top: 30px;
}

.message {
  text-align: center;
}
</style>