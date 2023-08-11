<template>
  <div v-if="showPopup">
    <div class="popup border-round box-shadow" style="padding: 5em;">
      <h2 class="popup-title">Choose an avatar</h2>
      <div class="image-grid">
        <div v-for="image in imageGrid" :key="image.id" @click="ModifyUserAvatarId(image)">
          <div class="image-frame">
            <img :src="image.img" :alt="'Image ' + image.id" />
          </div>
        </div>
      </div>
      <div>
        <label for="url">URL :</label>
        <input type="text" v-model="url" id="url" />
        <button @click="loadURLImage">Load an avatar</button>
      </div>
    </div>
  </div>

  <Accordion :activeIndex="0">
    <AccordionTab header="Profile">
      <div class="surface-section border-round box-shadow" style="padding: 5em;">

        <div class="grid-container">
          <div class="p-card p-component card" style="background-color: rgb(69, 60, 73); width: 29em;">
            <div class="p-card-body">
              <div @click="openPopup" class="selected-image" :class="{ active: showPopup }"
                style="background-color: rgb(37, 37, 37);">
                <img :src="selectedImage.img" :alt="'Image ' + selectedImage.id" type="pointer" />
              </div>
            </div>
          </div>

          <div class="profile-details">
            <ul class="list-none p-0 m-0">

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="font-medium text-3xl text-900 w-6 md:w-2 ">Profile
                </div>
                <Button label="View public profile" icon="pi pi-eye" @click="goToPublicProfile(username)" text />
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Username</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1"
                  :class="{ 'whitespace-nowrap': !isEditingUsername, 'text-justify': !isEditingUsername }">
                  <span v-if="!isEditingUsername">{{ username }}</span>
                  <input v-else type="text" v-model="editedUsername" @keyup.enter="ModifyUserUsername"
                    @keyup.esc="cancelEditing('username')" ref="usernameInput" style="width: auto;" data-v-ced23842=""
                    class="p-inputtext p-component p-inputtext-sm" data-pc-name="inputtext" data-pc-section="root"
                    placeholder="username" />
                </div>
                <div class="w-6 md:w-2 flex justify-content-end">
                  <Button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserUsername">
                    {{ isEditingUsername ? (isSavingUsername ? 'Saving... ' : 'Save ') : 'Edit' }}
                  </Button>
                </div>
              </li>

              <li class="flex align-items-center py-5 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">id</div>
                <div class="text-900 w-full md:w-8 md:flex-order-1 flex-order-1">
                  <Chip>{{ id }}</Chip>
                </div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Email</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1"
                  :class="{ 'whitespace-nowrap': !isEditingEmail, 'text-justify': !isEditingEmail }">
                  <span v-if="!isEditingEmail">{{ email }}</span>
                  <input v-else type="email" v-model="editedEmail" @keyup.enter="ModifyUserEmail"
                    @keyup.esc="cancelEditing('email')" ref="emailInput" style="width: auto;" data-v-ced23842=""
                    class="p-inputtext p-component p-inputtext-sm" data-pc-name="inputtext" data-pc-section="root"
                    placeholder="email" />
                </div>
                <div class="w-6 md:w-2 flex justify-content-end">
                  <Button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserEmail">
                    {{ isEditingEmail ? (isSavingEmail ? 'Saving...' : 'Save') : 'Edit' }}
                  </button>
                </div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 font-medium">Bio</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-grow-1"
                  :class="{ 'whitespace-nowrap': !isEditingBio, 'text-justify': !isEditingBio }">
                  <span v-if="!isEditingBio">{{ bio }}</span>
                  <input v-else type="text" v-model="editedBio" @keyup.enter="ModifyUserBio"
                    @keyup.esc="cancelEditing('bio')" ref="bioInput" style="width: auto;" data-v-ced23842=""
                    class="p-inputtext p-component p-inputtext-sm" data-pc-name="inputtext" data-pc-section="root"
                    placeholder="bio" />
                </div>
                <div class="w-4 md:w-2 flex justify-content-end">
                  <Button class="p-button-text" icon="pi pi-pencil" @click="ModifyUserBio">
                    {{ isEditingBio ? (isSavingBio ? 'Saving...' : 'Save') : 'Edit' }}
                  </button>
                </div>
              </li>

            </ul>
          </div>
        </div>
      </div>
  </AccordionTab>
  <AccordionTab header="Friends">

      <div class="surface-section border-round box-shadow " style="padding: 5em">
        <div class="p-inputgroup flex-1 mb-4">
          <span class="p-inputgroup-addon">
            <i class="pi pi-user"></i>
          </span>

          <Dropdown v-model="selectedFriend" editable :options="filteredUsernames" @input="filterUsernames"
            placeholder="Find by: Username / Id" class="w-full md:w-14rem" />

          <Button @click="addFriend" style="background-color: rgb(197, 72, 255)">Add</Button>
        </div>
        <ul class="list-none p-0 m-0">

          <!-- New list tiles -->

          <li class="h-32 flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap"
            v-for="(friend, index) in userFriends" :key="index" @mouseover="showDeleteIcon[index + 1] = true"
            @mouseout="showDeleteIcon[index + 1] = false">

            <div class="text-500 w-6 md:w-2 font-medium">
              <div class="friend-container">
                <div class="image-frame"
                  style="width: 75px; height: 75px; float: left; margin-right: 50px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #bd34e7; cursor: default;">
                  <img :src="getImageById(friend.img).img" :alt="'Avatar ' + friend.username"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div class="text-500 w-6 md:w-2 font-medium" style="overflow: hidden;">
                  <span style="display: block; margin-top: 5px;">{{ friend.username }}</span>
                </div>
              </div>

            </div>
            <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              <span v-if="friend.loggedIn">
                <Tag icon="pi pi-circle-fill" style="background-color: rgba(0, 0, 0, 0); color: rgb(102, 245, 102)"
                  value="Online"></Tag>
              </span>
            </div>
            <div class="w-6 md:w-2 flex justify-content-end space-x-2">
              <Button icon="pi pi-comment" v-show="showDeleteIcon[index + 1]" rounded class="mr-3" aria-label="PrivateMessage"
                style="background-color: rgb(93, 104, 225)" @click="removeFriend(index, friend)"></Button>
              <Button v-show="showDeleteIcon[index + 1]" icon="pi pi-eye" rounded class="mr-3" aria-label="ViewProfile"
                style="background-color: rgb(197, 72, 255)" @click="goToPublicProfile(friend.username)"></Button>
              <Button v-show="showDeleteIcon[index + 1]" icon="pi pi-ban pi-ban" rounded class="mr-3" aria-label="Ban"
                style="background-color: rgb(253, 174, 101)" @click="blockFriend(index, friend)"></Button>
              <Button icon="pi pi-times" v-show="showDeleteIcon[index + 1]" rounded class="mr-3" aria-label="Delete"
                style="background-color: rgb(247, 82, 118)" @click="removeFriend(index, friend)"></Button>
            </div>
          </li>
        </ul>
      </div>
    </AccordionTab>
    <AccordionTab header="History">
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
        corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
        culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
        expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
      </p>
    </AccordionTab>
    <AccordionTab header="statistics">
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
        corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
        culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
        expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
      </p>
    </AccordionTab>

  </Accordion>
</template>
  
<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';
import { server } from "@/utils/helper";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { User } from '@/utils/interfaces';
import router from '@/router';


export default defineComponent({
  name: 'ProfileView',
  computed: {
    username() {
      return store.state.user.username;
    },
    email() {
      return store.state.user.email;
    },
    bio() {
      return store.state.user.bio;
    },
    id() {
      return store.state.user.id;
    },
    imgId() {
      return store.state.user.img;
    },
    selectedImage() {
      return this.getImageById(this.imgId);
    },
  },
  mounted() {
    this.getAllFriends();
    this.getAllUsernames();
  },
  data() {
    return {
      isEditingEmail: false as boolean,
      isSavingEmail: false as boolean,
      editedEmail: store.state.user.email as string | null,

      isEditingBio: false as boolean,
      isSavingBio: false as boolean,
      editedBio: store.state.user.bio as string | null,

      isEditingUsername: false as boolean,
      isSavingUsername: false as boolean,
      editedUsername: store.state.user.username as string | null,

      showPopup: false as boolean,
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
      url:'' as string | null,

      userFriends: [] as User[],
      isInputAddFriendsFocused: false,
      selectedFriend: '' as string,
      usernames: [] as string[],
      filteredUsernames: [] as string[],
      showDeleteIcon: [] as boolean[],
    }
  },
  methods:
  {
    openPopup() {
      this.showPopup = true;
    },

    getImageById(id: string | null) {
  if (!id) {
    return { id: 1, img: require('@/assets/welc.jpeg') };
  } else if (id && id.length < 2) {
    return this.imageGrid.find(image => image.id === id);
  } else {
    // Si l'ID est une URL, chargez l'image à partir de l'URL
    if (id.length > 2) {
      return { id: id, img: id }; // Utilisez l'ID (l'URL) comme source de l'image
    } else {
      return { id: 1, img: require('@/assets/welc.jpeg') };
    }
  }
},

    async loadURLImage() {
      if (this.url) {
        if (await this.isValidURL(this.url)) {
          this.ModifyStoreAvatarId(this.url);
          if (this.imgId)
          {
            this.imageGrid.push({ id: this.imgId, img: null });
            this.url = ''; // Réinitialise l'URL
          }
        } else {
          alert('Invalid URL');
          this.url = '';
        }
      }
    },

    async isValidURL(url: string) {
      try {
        const response = await axios.head(url);
        return response.status === 200;
      } catch (error) {
        return false;
      }
    },

    goToPublicProfile(username: string | null) {
      if (username)
        router.push(`/profile/${username}`);
    },

    cancelEditing(field : string) {
      if (field === 'username') {
        this.editedUsername = this.username;
        this.isEditingUsername = false;
      } else if (field === 'email') {
        this.editedEmail = this.email;
        this.isEditingEmail = false;
      } else if (field === 'bio') {
        this.editedBio = this.bio;
        this.isEditingBio = false;
      }
    },

    async ModifyUserAvatarId(image) {
      this.ModifyStoreAvatarId(image.id);
      const user = store.state.user;
      axios.defaults.baseURL = server.nestUrl;
      await axios.post('/api/user/update', user,
        { headers: { "Authorization": `Bearer ${store.state.user.hash}` } })
        .then((response: AxiosResponse) => {
          console.log(response);
        })
        .catch((error: AxiosError) => {
          console.log(error);
        })
      this.showPopup = false;
    },

    async ModifyUserBio() {
      if (this.isEditingBio) {
        if (this.editedBio !== null) {
          if (this.editedBio.length > 500) {
            alert("Bio cannot exceed 500 characters.");
            return;
          }
        }
        this.ModifyStoreBio();
        const user = store.state.user;
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/update', user, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
          .then((response: AxiosResponse) => {
            console.log(response);
          })
          .catch((error: AxiosError) => {
            console.log(error);
          });
        this.isSavingBio = false;
      }
      this.isEditingBio = !this.isEditingBio;
      if (this.isEditingBio) {
        this.$nextTick(() => {
          const bioInput = this.$refs.bioInput as HTMLInputElement | null;
          if (bioInput) {
            bioInput.focus();
          }
        });
      }
    },

    async ModifyUserEmail() {
      if (this.isEditingEmail) {
        if (this.editedEmail !== null) {
          if (this.editedEmail.trim() === '') {
            alert("Email cannot be empty.");
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editedEmail)) {
            alert("Invalid email format.");
            return;
          }
        }
        this.ModifyStoreEmail();
        const user = store.state.user;
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/update', user, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
          .then((response: AxiosResponse) => {
            console.log(response);
          })
          .catch((error: AxiosError) => {
            console.log(error);
          });
        this.isSavingEmail = false;
      }
      this.isEditingEmail = !this.isEditingEmail;
      if (this.isEditingEmail) {
        this.$nextTick(() => {
          const emailInput = this.$refs.emailInput as HTMLInputElement | null;
          if (emailInput) {
            emailInput.focus();
          }
        });
      }
    },

    async ModifyUserUsername() {
      if (this.isEditingUsername) {
        if (this.editedUsername !== null) {
          if (this.editedUsername.trim() === '') {
            alert("Username cannot be empty.");
            return;
          }
          if (this.editedUsername.length > 50) {
            alert("Username cannot exceed 50 characters.");
            return;
          }
          if (/\s/.test(this.editedUsername)) {
            alert("Username cannot contain whitespace.");
            return;
          }
        }
        this.ModifyStoreUsername();
        const user = store.state.user;
        axios.defaults.baseURL = server.nestUrl;
        await axios.post('/api/user/update', user, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
          .then((response: AxiosResponse) => {
            console.log(response);
          })
          .catch((error: AxiosError) => {
            console.log(error);
          });
        this.isSavingUsername = false;
      }
      this.isEditingUsername = !this.isEditingUsername;
      if (this.isEditingUsername) {
        this.$nextTick(() => {
          const usernameInput = this.$refs.usernameInput as HTMLInputElement | null;
          if (usernameInput) {
            usernameInput.focus();
          }
        });
      }
    },

    async getAllUsernames() {
      axios.defaults.baseURL = server.nestUrl;
      await axios
        .get(`/api/user/`, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.usernames = response.data.map((user) => user.username);
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async getAllFriends() {
      axios.defaults.baseURL = server.nestUrl;
      await axios
        .get(`/api/user/friends`, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
          if (response.data)
            this.userFriends = response.data[0].friend.map((user) => user);
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    filterUsernames() {
      const searchQuery = this.selectedFriend.toLowerCase();
      if (searchQuery != '') {
        this.filteredUsernames = this.usernames.filter((username) =>
          username.toLowerCase().includes(searchQuery)
        ).slice(0, 4);
      } else {
        this.filteredUsernames = [];
      }
    },

    async getUserById(id: number): Promise<User | null> {
      axios.defaults.baseURL = server.nestUrl;
      return await axios
        .get(`/api/user/${id}`, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
          return response.data as User;
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async getUserByUsername(username: string): Promise<User | null> {
      axios.defaults.baseURL = server.nestUrl;
      return await axios
        .get(`/api/user/username/${username}`, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
          return response.data as User;
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async addFriend() {
      if (this.selectedFriend.trim() === '') {
        return;}
      const id = parseInt(this.selectedFriend);
      let friend = null as User | null;
      if (!isNaN(id)) {
        friend = await this.handleIdSearch(id);
      } else {
        friend = await this.handleUsernameSearch(this.selectedFriend);
      }
      if (friend)
      {
        axios.defaults.baseURL = server.nestUrl;
        return axios
          .post(`/api/user/friends/add`, friend, {
            headers: { Authorization: `Bearer ${store.state.user.hash}` },
          })
          .then((response: AxiosResponse) => {
            console.log(response);
          })
          .catch((error: AxiosError) => {
            console.error(error);
          });
      }
    },

    async handleIdSearch(id: number): Promise<User | null> {
      const user = await this.getUserById(id);
      if (user && user.username && (user.username !== this.username)) {
        if (!this.userFriends.some((friend) => friend.id === user.id)) {
          this.userFriends.push(user);
          this.showDeleteIcon.push(false);
          this.selectedFriend = '';
          return (user);
        } 
        else
        alert('This friend is already registered in your friends list.');
      }
      else if (user && user.username && (user.username === this.username))
        alert("You can't add yourself in your friends list.");
      else {
        alert('User with provided id not found.');
      }
      return null;
    },

    async handleUsernameSearch(username: string): Promise<User | null> {
      const user = await this.getUserByUsername(username);
      if (user && user.username && (user.username !== this.username)) {
        if (!this.userFriends.some((friend) => friend.id === user.id)) {
          this.userFriends.push(user);
          this.showDeleteIcon.push(false);
          this.selectedFriend = '';
          return (user);
        }
        else
        alert('This friend is already registered in your friends list.');
      }
      else if (user && user.username && (user.username === this.username))
        alert("You can't add yourself in your friends list.");
      else {
        alert('User with provided username not found.');
      }
      return null;
    },

    async blockFriend(index: number, user: User) {
      this.removeFriend(index, user);
      axios.defaults.baseURL = server.nestUrl;
      return await axios
        .post(`/api/user/block/add`, user,
        {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async removeFriend(index: number, user: User) {
      this.userFriends.splice(index, 1);
      this.showDeleteIcon.splice(index + 1, 1);
      return await axios
        .post(`/api/user/friends/del`, user,
        {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    displayFriendsList() {
      if (this.userFriends.length > 0) {
        console.log("friends list : ", this.userFriends);
      } else {
        console.log("No friends registered.");
      }
    },

    ModifyStoreUsername() {
      store.commit('setUsername', this.editedUsername);
    },
    ModifyStoreEmail() {
      store.commit('setEmail', this.editedEmail);
    },
    ModifyStoreBio() {
      store.commit('setBio', this.editedBio);
    },
    ModifyStoreAvatarId(id) {
      store.commit('setAvatarId', id);
    },
  },
})
</script>
  
  
<style scoped>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #49354f;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  z-index: 2;
}

.popup-title {
  color: #000;
  font-size: 1.4em;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-align: left;
  padding-bottom: 0.3cm;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-frame {
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #000;
}

.image-frame img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}


.selected-image {
  cursor: pointer;
  z-index: 1;
}

.selected-image.active {
  border: 2px solid #000;
}

.grid-container {
  display: grid;
  grid-template-columns: 32em;
  grid-gap: 1em;
}

.card {
  grid-column: 1;
}

.selected-image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.selected-image img {
  width: 500px;
  height: 500px;
  border-radius: 50%;
  object-fit: cover;
  padding: 30px;
}

.profile-details {
  grid-column: 2;
}

.myBackground {
  background:
    linear-gradient(#290526, transparent),
    linear-gradient(to top left, #2e081f, transparent),
    linear-gradient(to top right, #1e1546, transparent),
    linear-gradient(to left, #00000000, #19032583);
  background-blend-mode: screen;
}
</style>
