
<template>
  <img  v-if="user" :src="getImageById(user.img).img" :alt="'Image ' + getImageById(user.img).id" />
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '@/utils/interfaces';



export default defineComponent({
name: 'LoadAvatar',
props: {
    user: {
      type: Object as () => User,
      required: true,
    },
  },
data() {
    return {
        imageGrid: [
            { id: "1", img: require('@/assets/profiles/profil_1.jpg') },
            { id: "2", img: require('@/assets/profiles/profil_2.jpg') },
            { id: "3", img: require('@/assets/profiles/profil_3.jpg') },
            { id: "4", img: require('@/assets/profiles/profil_4.jpg') },
            { id: "5", img: require('@/assets/profiles/profil_5.jpg') },
            { id: "6", img: require('@/assets/profiles/profil_6.jpg') },
            { id: "7", img: require('@/assets/profiles/profil_7.jpg') },
            { id: "8", img: require('@/assets/profiles/profil_8.jpg') },
            { id: "9", img: require('@/assets/profiles/profil_9.jpg') },
    ],
  }
},
methods: 
{
    getImageById(id: string | null) {
        if (!id) {
            return { id: 1, img: require('@/assets/welc.jpeg') }; }
        else if (id && id.length < 2) {
            return this.imageGrid.find(image => image.id === id); } 
        else {
            if (id.length > 2) {
                return { id: id, img: id }; }
        else {
        return { id: 1, img: require('@/assets/welc.jpeg') }; }
    }
  },
}
})
</script>
  