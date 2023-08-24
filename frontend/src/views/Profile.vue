<template>
  <div v-if="showPopup">
    <div class="popup">
      <div class="popup-header">
        <span class="p-font-weight-bold text-900">Choose your avatar</span>
        <Button icon="pi pi-times" rounded class="p-button-secondary"
          style="background-color: rgb(211, 177, 224); color: rgb(30, 27, 31);" @click="closePopup">
        </Button>
      </div>
      <Divider />
      <div class="image-grid">
        <div v-for="image in imageGrid" :key="image.id" @click="ModifyUserAvatarId(image)">
          <div class="image-frame">
            <img :src="image.img" :alt="'Image ' + image.id" />
          </div>
        </div>
      </div>
      <Divider />
      <div>
        <div class="p-inputgroup flex-1">
          <span class="p-inputgroup-addon"><i class="pi pi-download"></i></span>
          <InputText placeholder="Enter the URL of your image" v-model="url" id="url" @keyup.enter="loadURLImage()" />
          <Button @click="loadURLImage">download</Button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="ShowTwoFA">
    <div class="popup">
      <div class="popup-header">
        <span class="p-font-weight-bold text-900">Two Authorization Factor</span>
        <div class="px-4">
          <Button v-if="!TwoFA || TwoFA?.length === 0" @click="Enable2FA">Enable</Button>
          <Button v-else @click="Disable2FA">Disable</Button>
        </div>
        <Button icon="pi pi-times" rounded class="p-button-secondary"
          style="background-color: rgb(211, 177, 224); color: rgb(30, 27, 31);" @click="close2FA">
        </Button>
      </div>
      <div class="p-4 m-4">
        <img v-if="QRcode.length" :src="QRcode" />
      </div>
      <div>
        <div class="p-inputgroup flex-1">
          <span class="p-inputgroup-addon"><i class="pi pi-qrcode"></i></span>
          <InputText placeholder="Enter secret" v-model="TwoFASecret" id="url" @keyup.enter="Check2FA()" />
          <Button @click="Check2FA">Verify</Button>
        </div>
      </div>
    </div>
  </div>

  <Accordion :activeIndex="0">

    <AccordionTab header="Profile">
      <div class="surface-section border-round box-shadow" style="padding: 5em;">
        <div class="grid-container">
          <div class="p-card p-component card" style="background-color:#121212; width: 29em;">
            <div class="p-card-body">
              <div @click="openPopup" class="selected-image" :class="{ active: showPopup }"
                style="background-color: rgb(37, 37, 37);">
                <div v-if="selectedImage">
                  <img :src="selectedImage.img" :alt="'Image ' + selectedImage.id" type="pointer" />
                </div>
              </div>
            </div>
          </div>

          <div class="profile-details">
            <ul class="list-none p-0 m-0">
              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="font-medium text-3xl text-900 w-6 md:w-2 mr-8">My profile
                </div>
                <Button label="View my public profile" icon="pi pi-eye" @click="goToPublicProfile(username)" text />
                <Button @click="open2FA" class="mx-8">2FA</Button>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 mr-8 font-medium">Username</div>
                <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1"
                  :class="{ 'whitespace-nowrap': !isEditingUsername, 'text-justify': !isEditingUsername }">
                  <span v-if="!isEditingUsername">{{ username }}</span>
                  <input v-else type="text" v-model="editedUsername" @keyup.enter="ModifyUserUsername"
                    @keyup.esc="cancelEditing('username')" ref="usernameInput" style="width: auto;" data-v-ced23842=""
                    class="p-inputtext p-component p-inputtext-sm" data-pc-name="inputtext" data-pc-section="root"
                    placeholder="username" />
                </div>
                <div class="ml-7 flex justify-content-end">
                  <Button class="p-button-text ml-2" icon="pi pi-pencil" @click="ModifyUserUsername">
                    {{ isEditingUsername ? (isSavingUsername ? 'Saving... ' : 'Save ') : 'Edit' }}
                  </Button>
                </div>
              </li>

              <li class="flex align-items-center py-5 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 mr-8 font-medium">id</div>
                <div class="text-900 w-full md:w-8 md:flex-order-1 flex-order-1">
                  <Chip>{{ id }}</Chip>
                </div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 mr-8 font-medium">Email</div>
                <div class="bio-text text-900 w-full md:w-8 md:flex-order-0 flex-order-1"
                  :class="{ 'whitespace-nowrap': !isEditingEmail, 'text-justify': !isEditingEmail }">
                  <span v-if="!isEditingEmail">{{ email }}</span>
                  <input v-else type="email" v-model="editedEmail" @keyup.enter="ModifyUserEmail"
                    @keyup.esc="cancelEditing('email')" ref="emailInput" style="width: auto;" data-v-ced23842=""
                    class="p-inputtext p-component p-inputtext-sm" data-pc-name="inputtext" data-pc-section="root"
                    placeholder="email" />
                </div>
                <div class="ml-7 flex justify-content-end">
                  <Button class="p-button-text ml-2" icon="pi pi-pencil" @click="ModifyUserEmail">
                    {{ isEditingEmail ? (isSavingEmail ? 'Saving...' : 'Save') : 'Edit' }}
                  </button>
                </div>
              </li>

              <li class="flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap">
                <div class="text-500 w-6 md:w-2 mr-8 font-medium">Bio</div>
                <div class="bio-text text-900 w-full md:w-8 md:flex-order-0 flex-grow-1"
                  :class="{ 'whitespace-nowrap': !isEditingBio, 'text-justify': !isEditingBio, 'text-overflow-ellipsis': !isEditingBio }">
                  <span v-if="!isEditingBio">{{ bio }}</span>
                  <Textarea v-else v-model="editedBio" rows="3" @keyup.esc="cancelEditing('bio')" ref="bioInput"
                    style="width: 100%;" class="p-inputtextarea p-component p-inputtextarea-sm" placeholder="bio" />
                </div>
                <div class="ml-7 flex justify-end">
                  <Button class="p-button-text mr-1" icon="pi pi-pencil" @click="ModifyUserBio">
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
            <div class="text-500 w-6 md:w-2 ">
              <div class="friend-container align-items-center flex">
                <div class="image-frame m2"
                  style="width: 75px; height: 75px; float: left; margin-right: 15%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #bd34e7; cursor: default;">
                  <img :src="getImageById(friend.img).img" :alt="'Avatar ' + friend.username"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div class="text-500 font-medium text-left flex items-center" style="overflow: hidden;">
                  <span
                    style="display: block; margin-top: 5px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"
                    title="{{ friend.username }}">
                    {{ friend.username }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-900 w-full md:w-8 flex items-center">
              <span v-if="friend.loggedIn">
                <Tag class="pr-6 mt-1" icon="pi pi-circle-fill"
                  style="background-color: rgba(0, 0, 0, 0); color: rgb(102, 245, 102)" value="Online"></Tag>
              </span>
              <span v-if="friend.inGame">
                <Tag class="mt-1" icon="pi pi-circle-fill"
                  style="background-color: rgba(0, 0, 0, 0); color: rgb(245, 102, 126)" value="In game"></Tag>
              </span>
            </div>

            <div class="w-6 md:w-2 flex justify-content-end space-x-2">
              <Button icon="pi pi-comment" v-show="showDeleteIcon[index + 1]" rounded class="mr-3" aria-label="Delete"
                style="background-color: rgb(93, 104, 225)" @click="privateMessage(index, friend)"></Button>
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

    <AccordionTab header="Bloqued">
      <div class="surface-section border-round box-shadow " style="padding: 5em">
        <div class="p-inputgroup flex-1 mb-4">
          <span class="p-inputgroup-addon">
            <i class="pi pi-lock"></i>
          </span>
          <Dropdown v-model="selectedBlock" editable :options="filteredUsernames" @input="filterUsernames"
            placeholder="Find by: Username / Id" class="w-full md:w-14rem" />
          <Button @click="addFriend" style="background-color: rgb(197, 72, 255)">Add</Button>
        </div>

        <ul class="list-none p-0 m-0">

          <!-- New list tiles -->
          <li class="h-32 flex align-items-center py-4 px-2 border-top-1 surface-border flex-wrap"
            v-for="(blocked, index) in userBlocked" :key="index" @mouseover="showDeleteIcon[index + 1] = true"
            @mouseout="showDeleteIcon[index + 1] = false">
            <div class="text-500 w-6 md:w-2 font-medium">
              <div class="friend-container">
                <div class="image-frame"
                  style="width: 75px; height: 75px; float: left; margin-right: 50px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #bd34e7; cursor: default;">
                  <img :src="getImageById(blocked.img)?.img" :alt="'Avatar ' + blocked.username"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div class="text-500 w-8 md:w-4 font-medium" style="overflow: hidden;">
                  <span
                    style="display: block; margin-top: 5px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"
                    title="{{ friend.username }}">
                    {{ blocked.username }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 ">
              <span v-if="blocked.loggedIn">
                <Tag class="pr-6" icon="pi pi-circle-fill"
                  style="background-color: rgba(0, 0, 0, 0); color: rgb(102, 245, 102)" value="Online"></Tag>
              </span>
              <span v-if="blocked.ingame">
                <Tag icon="pi pi-circle-fill" style="background-color: rgba(0, 0, 0, 0); color: rgb(245, 102, 126)"
                  value="In game"></Tag>
              </span>
            </div>
            <div class="w-6 md:w-2 flex justify-content-end space-x-2">
              <Button v-show="showDeleteIcon[index + 1]" icon="pi pi-eye" rounded class="mr-3" aria-label="ViewProfile"
                style="background-color: rgb(197, 72, 255)" @click="goToPublicProfile(blocked.username)"></Button>
              <Button icon="pi pi-times" v-show="showDeleteIcon[index + 1]" rounded class="mr-3" aria-label="Delete"
                style="background-color: rgb(247, 82, 118)" @click="removeBlock(index, blocked)"></Button>
            </div>
          </li>
        </ul>
      </div>
    </AccordionTab>

    <AccordionTab header="Leaderboard">
      <div class="surface-section border-round box-shadow" style="padding: 5em;">
        <div class="surface-section">
          <ul class="list-none p-0 m-0">
            <li class="rankTab flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap opacity-60 mb-3"
              style="background: linear-gradient(to top right, #bd34e7, #0052b0);">
              <div class="text-900 w-6 md:w-2 text-2xl font-medium">Rank</div>
              <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                <div class="text-900 w-6 md:w-2 text-2xl font-medium">Username</div>
              </div>
              <div class="w-6 md:w-2 flex justify-content-end">
                <div class="text-900 text-2xl font-medium">Games won</div>
              </div>
            </li>

            <li v-for="user in leaderBoard" :key="user.id" class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap">
              <div class="text-500 w-6 md:w-2 font-medium">index</div>
              <div class="align-items-center flex w-8">
                <div
                  style="width: 75px; height: 75px; float: left; margin-right: 5%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #bd34e7; cursor: default;">
                  <img :src="getImageById(user.img)?.img" :alt="'Avatar'"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div class="text-500 font-medium text-left flex items-center" style="overflow: hidden;">
                  <span
                    style="display: block; margin-top: 5px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"
                    title="username">
                    {{user.username}}
                  </span>
                </div>
              </div>
              <div class="w-6 md:w-2 flex justify-content-end">
                <span>{{userWins(user.win)}}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </AccordionTab>

    <AccordionTab header="History">
      <div class="surface-section border-round box-shadow" style="padding: 5em;">
        <div class="surface-section">
          <ul class="list-none p-0 m-0">
            <li class="flex justify-content-between flex-wrap border-top-1 surface-border py-3 px-3 opacity-60 mb-4"
              style="background: linear-gradient(to top right, #bd34e7, #0052b0);">

              <div class="text-900 text-2xl font-bold flex align-items-center justify-content-center"
                style="width: 200px;">Score P1</div>
              <div class="text-900 text-2xl font-bold flex align-items-center justify-content-center"
                style="width: 200px;">Player 1</div>
              <div class="font-bold flex align-items-center justify-content-center" style="width: 200px;">
                <h2 class="neonText pulsate mt-2">VS</h2>
              </div>
              <div class="text-900 text-2xl font-bold flex align-items-center justify-content-center"
                style="width: 200px;">Player 2</div>
              <div class="text-900 text-2xl font-bold flex align-items-center justify-content-center"
                style="width: 200px;">Score P2</div>
            </li>

            <li v-for="history in gameHistoric" :key="history.id" class="flex justify-content-between flex-wrap border-top-1 surface-border py-3 px-3 mb-2"
              v-bind:class="[history.winnerID == id ? 'win' : 'loose']">

              <div class="font-bold flex align-items-center justify-content-center"
                style="width: 200px; min-height: 50px">
                {{history.score.split('-')[0]}}
              </div>

              <div class="align-items-center flex justify-content-center" style="width: 200px; min-height: 50px">
                <div
                  style="width: 75px; height: 75px; float: left; margin-right: 20%; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #5f6767; cursor: default;">
                  <img :src="getImageById(history?.winner?.img).img" :alt="'Avatar'"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div class="text-500 font-medium text-left flex items-center" style="overflow: hidden;">
                  <span
                    style="display: block; margin-top: 5px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"
                    title="username">
                    {{userScore(history.score, true)}}
                  </span>
                </div>
              </div>
              <div class="font-bold flex align-items-center justify-content-center"
                style="width: 200px; min-height: 50px">
                <h2 class="neonText pulsate mt-2">VS</h2>
              </div>

              <div class="align-items-center flex justify-content-center" style="width: 200px; min-height: 50px">
                <div class="text-500 font-medium text-left flex items-center"
                  style="overflow: hidden; margin-right: 20%;">
                  <span
                    style="display: block; margin-top: 5px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;"
                    title="username">
                    {{history?.looser?.username}}
                  </span>
                </div>
                <div
                  style="width: 75px; height: 75px; float: left; border-radius: 50%; overflow: hidden; box-shadow: 0 0 20px #5f6767; cursor: default;">
                  <img :src="getImageById(history?.looser?.img).img" :alt="'Avatar'"
                    style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
              </div>
              <div class="font-bold flex align-items-center justify-content-center"
                style="width: 200px; min-height: 50px">
                {{userScore(history.score, false)}}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </AccordionTab>
  </Accordion>
</template>
 
<script lang="ts">
import store from '@/store';
import { defineComponent } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { User, Historic } from '@/utils/interfaces';
import router from '@/router';
import socket from '@/utils/socket';
import { useToast } from "primevue/usetoast";


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

    TwoFA() {
      return store.state.user.twoFA;
    }
  },

  mounted() {
    this.getAllFriends();
    this.getAllBlocked();
    this.getAllUsernames();
    this.getHistory();
    this.getLeaderBoard();
  },

  data() {
    return {
      toast: useToast(),
      ShowTwoFA: false as boolean,
      TwoFASecret: "" as string,
      QRcode: "" as string,

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
      url: '' as string | null,

      userFriends: [] as User[],
      isInputAddFriendsFocused: false,
      selectedFriend: '' as string,
      usernames: [] as string[],
      filteredUsernames: [] as string[],
      showDeleteIcon: [] as boolean[],

      selectedBlock: '' as string,
      userBlocked: [] as User[],

      gameHistoric: [] as Historic[],
      leaderBoard: [] as User[],
    }
  },

  methods:
  {
    async getHistory() {
      await axios
        .get(`/api/historic/${store.state.user.id}`, {
            headers: { Authorization: `Bearer ${store.state.user.hash}` },
          })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.gameHistoric = response.data;
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async getLeaderBoard() {
      await axios
        .get(`/api/historic/leaderboard`, {
            headers: { Authorization: `Bearer ${store.state.user.hash}` },
          })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.leaderBoard = response.data;
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    userWins(wins: History[]): number {
      if (!wins || !wins.length)
        return (0);
      let count = 0;
      for (let i = 0; i < wins.length; i++) {
        count++;
      }
      return count;
    },

    userScore(score: string, side: boolean): string {
      if (score === "forfeit") {
        if (side)
          return "won by forfeit";
        return "lost by forfeit";
      }
      else {
        let less = score.split("-")[0];
        let more = score.split("-")[1];
        if (parseInt(less) > parseInt(more)) {
          const tmp = less;
          less = more;
          more = tmp;
        }
        if (side)
          return (more);
        return (less);
      }
    },

    open2FA() {
      this.ShowTwoFA = true;
    },

    close2FA() {
      this.ShowTwoFA = false;
    },

    async Check2FA() {
      console.log("Check2FA");
      if (!this.TwoFASecret.length)
        return;
      await axios
        .post(`/api/tfa/activation`,
          { secret: this.TwoFASecret },
          {
            headers: {
              Authorization: `Bearer ${store.state.user.hash}`,
            },
          })
        .then((response: AxiosResponse) => {
          console.log(response);
          if (response.data === true) {
            this.toast.add({severity: 'success', summary: 'Connected',
            detail: `Connexion with 2FA activated.`,
            life: 3000 });
            this.close2FA();
          }
          else {
            this.toast.add({severity: 'warn', summary: 'Not connected',
            detail: `Connexion with 2FA failed.`,
            life: 3000 });
          }
        })
        .catch((error: AxiosError) => {
          throw error;
        });
      this.TwoFASecret = "";
    },

    async Enable2FA() {
      console.log("Enable2FA");
      await axios
        .get(`/api/tfa/on`,
          {
            headers: {
              Authorization: `Bearer ${store.state.user.hash}`,
              'content-type': 'image/png',
              'accept': 'image/png'
            },
            responseType: 'blob',
          })
        .then((response: AxiosResponse) => {
          const urlCreator = window.URL || window.webkitURL
          this.QRcode = urlCreator.createObjectURL(response.data)
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async Disable2FA() {
      console.log("Disable2FA");
      await axios
        .get(`/api/tfa/off`,
          {
            headers: { Authorization: `Bearer ${store.state.user.hash}` },
          })
        .then((response: AxiosResponse) => {
          console.log(response);
          this.QRcode = "";
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async getAllBlocked() {
      await axios
        .get(`/api/user/blocked`, {
          headers: { Authorization: `Bearer ${store.state.user.hash}` },
        })
        .then((response: AxiosResponse) => {
          console.log(response);
          if (response.data)
            this.userBlocked = response.data[0].blocked.map((user) => user);
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    async addBlock() {
      if (this.selectedBlock.trim() === '') return;
      const id = parseInt(this.selectedBlock);
      let friend = null as User | null;
      if (!isNaN(id)) {
        friend = await this.handleIdSearch(id);
      } else {
        friend = await this.handleUsernameSearch(this.selectedBlock);
      }
      if (friend) {
        return axios
          .post(`/api/user/block/del`, friend, {
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

    async removeBlock(index: number, user: User) {
      this.userBlocked.splice(index, 1);
      this.showDeleteIcon.splice(index + 1, 1);
      return await axios
        .post(`/api/user/block/del`, user,
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

    openPopup() {
      this.showPopup = true;
    },

    closePopup() {
      this.showPopup = false;
    },

    getImageById(id: string | null) {
      if (!id) {
        return { id: 1, img: require('@/assets/welc.jpeg') };
      } else if (id && id.length < 2) {
        return this.imageGrid.find(image => image.id === id);
      } else {
        if (id.length > 2) {
          return { id: id, img: id };
        } else {
          return { id: 1, img: require('@/assets/welc.jpeg') };
        }
      }
    },

    async loadURLImage() {
      if (this.url) {
        if (await this.isValidURL(this.url)) {
          this.imageGrid.push({ id: this.url, img: this.url });
          this.ModifyUserAvatarId(this.imageGrid[this.imageGrid.length - 1]);
          this.showPopup = false;
        } 
        else {
          this.toast.add({severity: 'warn', summary: '',
            detail: `Invalid URL`,
            life: 3000 });
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


    async privateMessage(index: number, user: User) {
      await axios
        .post(`/api/room/private`, { user1: store.state.user, user2: user },
          {
            headers: { Authorization: `Bearer ${store.state.user.hash}` },
          })
        .then((response: AxiosResponse) => {
          console.log(response);
          socket.emit("join_room", { user: store.state.user, room: response.data });
          socket.emit("join_room", { user: user, room: response.data });
          router.push('Chat');
        })
        .catch((error: AxiosError) => {
          throw error;
        });
    },

    cancelEditing(field: string) {
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
          if (this.editedBio.length > 1000) {
            this.toast.add({severity: 'warn', summary: '',
            detail: `Bio cannot exceed 1000 characters.`,
            life: 3000 });
            return;
          }
        }
        this.ModifyStoreBio();
        const user = store.state.user;

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
    },

    async ModifyUserEmail() {
      if (this.isEditingEmail) {
        if (this.editedEmail !== null) {
          if (this.editedEmail.trim() === '') {
            this.toast.add({severity: 'warn', summary: '',
            detail: `Email cannot be empty.`,
            life: 3000 });
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editedEmail)) {
            this.toast.add({severity: 'warn', summary: '',
            detail: `Invalid email format.`,
            life: 3000 });
            return;
          }
        }
        this.ModifyStoreEmail();
        const user = store.state.user;

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
            this.toast.add({severity: 'warn', summary: '',
            detail: `Username cannot be empty.`,
            life: 3000 });
            return;
          }
          if (this.editedUsername.length > 25) {
            this.toast.add({severity: 'warn', summary: '',
            detail: `Username cannot exceed 25 characters.`,
            life: 3000 });
            return;
          }
          if (/\s/.test(this.editedUsername)) {
            this.toast.add({severity: 'warn', summary: '',
            detail: `Username cannot contain whitespace.`,
            life: 3000 });
            return;
          }
        }
        this.ModifyStoreUsername();
        const user = store.state.user;

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
        return;
      }
      const id = parseInt(this.selectedFriend);
      let friend = null as User | null;
      if (!isNaN(id)) {
        friend = await this.handleIdSearch(id);
      } else {
        friend = await this.handleUsernameSearch(this.selectedFriend);
      }
      if (friend) {
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
        else {
          this.toast.add({severity: 'warn', summary: '',
            detail: `This friend is already registered in your friends list.`,
            life: 3000 });
        }
      }
      else if (user && user.username && (user.username === this.username)) {
        this.toast.add({severity: 'warn', summary: '',
            detail: `You can't add yourself in your friends list.`,
            life: 3000 });
      }
      else {
        this.toast.add({severity: 'warn', summary: '',
            detail: `User with provided id not found.`,
            life: 3000 });
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
        else {
          this.toast.add({severity: 'warn', summary: '',
            detail: `This friend is already registered in your friends list.`,
            life: 3000 });
        }
      }
      else if (user && user.username && (user.username === this.username)) {
        this.toast.add({severity: 'warn', summary: '',
            detail: `You can't add yourself in your friends list.`,
            life: 3000 });
      }
      else {
        this.toast.add({severity: 'warn', summary: '',
            detail: `User with provided username not found.`,
            life: 3000 });
      }
      return null;
    },

    async blockFriend(index: number, user: User) {
      this.removeFriend(index, user);
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
  padding: 25px;
  border: 1px solid #c9a1dd;
  border-radius: 10px;
  text-align: center;
  z-index: 2;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
  outline-color: rgb(69, 60, 73);
  outline-style: outset;
  outline-width: 14px;
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
  padding: 45px;
}

.profile-details {
  grid-column: 2;
}

.bio-text {
  overflow-wrap: break-word;
  word-break: break-all;
  max-width: 100%;
}

.myBackground {
  background:
    linear-gradient(#290526, transparent),
    linear-gradient(to top left, #2e081f, transparent),
    linear-gradient(to top right, #1e1546, transparent),
    linear-gradient(to left, #00000000, #19032583);
  background-blend-mode: screen;
}

.win {
  background: linear-gradient(to top right, #34e764ae, #0db985a2);
}

.loose {
  background: linear-gradient(to top right, #e73434ae, #b90d6ba2);
}
</style>
