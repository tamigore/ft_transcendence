<template>
	<div class="main-container">
		<p>Hello World!</p>
		<button @click="count++">Add 1</button>
		<p>Count is: {{ count }}</p>
		<p>This is my local counter</p>
	</div>
	<div>
		<button @clique="handleChange">Login</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	// name: 'App',
	// 	components: {
	// },
	methods: {
		handleChange(event: Event) {
			// `event` implicitly has `any` type
			console.log((event.target as HTMLInputElement).value)
		}
	}
})
</script>

<style>
body {
	padding: 0;
	margin: 0;
}

#app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.main-container {
	width: 100%;
	height: 100%;
	position: absolute;
}
</style>

