<template>
  <div class="flex h-screen w-screen">
    <div class="grid h-screen w-screen grid-nogutter surface-section text-800">
      <div class="h-screen col-12 md:col-6 p-6 text-center md:text-left flex align-items-center myBackground">
        <section class="box-shadow" style="margin: 12%;">
          <section class="flex flex-column">
            <span class="block text-6xl font-bold mb-1">You want to play ?</span>
            <div class="text-6xl text-primary font-bold mb-3">Sign Up</div>
            <p class="mt-0 mb-4 text-700 line-height-3">Already Signed Up ? Sign In just here !</p>
          </section>

          <section class="flex">
            <Button label="Sign Up" v-on:click="ToggleSignup()" type="button" class="mr-3 p-button-raised"></Button>
            <Button label="Sing In" v-on:click="ToggleSignin()" type="button" class="p-button-outlined"></Button>
          </section>
        </section>
      </div>
      <div class="h-screen col-12 md:col-6 overflow-hidden myReverseBackground">
        <img :src="require(`@/assets/neon-SignUp-ping-pong.jpg`)" alt="Image" class="md:ml-auto block md:h-full" style="clip-path: polygon(8% 0, 100% 0%, 100% 100%, 0 100%)">
      </div>
    </div>
  </div>
  <div class="z-5" style="display: flex; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
    <div v-if="signupTriggers">
      <SignUp />
    </div>
    <div v-if="signinTriggers">
      <SignIn />
    </div>
  </div>
</template>

<style>
.myBackground {
  background:
        linear-gradient( #290526, transparent),
        linear-gradient(to top left, #2e081f, transparent),
        linear-gradient(to top right, #1e1546, transparent),
        linear-gradient(to left, #00000000, #19032583);
  background-blend-mode: screen;
}

.myReverseBackground {
  background:
        linear-gradient( #290526, transparent),
        linear-gradient(to top left, #1e1546, transparent),
        linear-gradient(to top right, #2e081f, transparent),
        linear-gradient(to right, #00000000, #19032583);
  background-blend-mode: screen;
}

.box-shadow {
  border: 0.2rem solid #fff;
  border-radius: 2rem;
  padding: 5em;
  box-shadow: 0 0 .2rem #fff,
              0 0 .2rem #fff,
              0 0 2rem #bc13fe,
              0 0 0.8rem #bc13fe,
              0 0 2.8rem #bc13fe,
              inset 0 0 1.3rem #bc13fe;
}
</style>

<script lang="ts">
import router from '@/router';
import store from '@/store';
import { defineComponent } from 'vue';
import SignIn from '@/components/SignIn.vue';
import SignUp from '@/components/SignUp.vue';

export default defineComponent ({
  name: 'HomeView',
  components: {
    SignIn,
    SignUp,
  },
  data() {
    return {
      signinTriggers: false as boolean,
      signupTriggers: false as boolean,
    }
  },
  mounted() { 
    if (store.state.user.logged == true) {
      router.push("/profile");
    return ;
    }
  },
  methods: {
    ToggleSignin() {
      this.signinTriggers = !this.signinTriggers
      if (this.signupTriggers == true)
        this.signupTriggers = !this.signupTriggers
    },
    ToggleSignup() {
      this.signupTriggers = !this.signupTriggers
      if (this.signinTriggers == true)
        this.signinTriggers = !this.signinTriggers
    },
  }
})
</script>