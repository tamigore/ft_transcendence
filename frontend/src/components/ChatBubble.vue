<template>
  <div class="bubble" v-bind:class="[ owner ? '.right' : '.left']">
    <div class="flex w-full gap-2 p-4 flex-row">
      Username:
      <p>{{ username }}</p>
      <p>{{ text }}</p>
      <p>{{ date }}</p>
    </div>
  </div>
</template>

<style>
.bubble {
  --r: 25px; /* the radius */
  --t: 30px; /* the size of the tail */
  
  max-width: 300px;
  padding: calc(2*var(--r)/3);
  -webkit-mask: 
    radial-gradient(var(--t) at var(--_d) 0,#0000 98%,#000 102%) 
      var(--_d) 100%/calc(100% - var(--r)) var(--t) no-repeat,
    conic-gradient(at var(--r) var(--r),#000 75%,#0000 0) 
      calc(var(--r)/-2) calc(var(--r)/-2) padding-box, 
    radial-gradient(50% 50%,#000 98%,#0000 101%) 
      0 0/var(--r) var(--r) space padding-box;
  background: linear-gradient(135deg,#ba00fe,#3d6ced) border-box;
  color: #fff;
}
.left {
  --_d: 0%;
  border-left: var(--t) solid #0000;
  margin-right: var(--t);
  place-self: start;
}
.right {
  --_d: 100%;
  border-right: var(--t) solid #0000;
  margin-left: var(--t);
  place-self: end;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "ChatBubble",
  props: {
    username: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true },
    owner: { type: Boolean, required: true},
  },
})
</script>