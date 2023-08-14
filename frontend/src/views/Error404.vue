<template>
  <div class="container">
    <h1 class="neonText pulsate mt-8">
      404
    </h1>
    <h2 class="neonText pulsate">Page Not Found</h2> 
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
 name: 'ErrorNotFound',
})
</script>

<style>
.neonText {
  color: #fff;
  text-shadow:
    0 0 7px #fff,
    0 0 10px #fff,
    0 0 21px #fff,
    0 0 42px #0fa,
    0 0 82px #0fa,
    0 0 92px #0fa,
    0 0 102px #0fa,
    0 0 151px #0fa;
}

/* Additional styling */
body {
  font-size: 18px;
  font-family: "Helvetica Neue", sans-serif;
  background-color: #010a01;
}  

h1, h2 {
  text-align: center;
  text-transform: uppercase;
  font-weight: 400;
}
  
h1 {
  font-size: 4.2rem;
}

.pulsate {
  animation: pulsate 1.5s infinite alternate;     
}
  
h2 {
  font-size: 1.8rem;
}

@keyframes pulsate {
  100% {
    /* Larger blur radius */
    text-shadow:
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #0fa,
      0 0 80px #0fa,
      0 0 90px #0fa,
      0 0 100px #0fa,
      0 0 150px #0fa;
  }
  0% {
    /* Smaller blur radius */
    text-shadow:
      0 0 2px #fff,
      0 0 4px #fff,
      0 0 6px #fff,
      0 0 10px #0fa,
      0 0 45px #0fa,
      0 0 55px #0fa,
      0 0 70px #0fa,
      0 0 80px #0fa;
  }
}
</style>
