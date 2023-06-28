<template>
  <div>
    <BurgerMenu v-bind="this.$attrs" @openMenu="openMenu" @closeMenu="closeMenu">
      <slot></slot>
    </BurgerMenu>
  </div>
</template>

<script>
import BurgerMenu from '@/components/BurgerMenu.vue';

export default {
  name: 'ChatMenu',
  components: {
    BurgerMenu,
  },
  methods: {
    openMenu() {
      this.$emit('openMenu');
    },
    closeMenu() {
      this.$emit('closeMenu');
    }
  }
};
</script>
