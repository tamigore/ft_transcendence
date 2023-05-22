<template>
    <section>
        <div>
            <div class="fetch-profile">
                <button @click="SignUpPost" class="btn-users">SignUp</button>
                <button @click="SignInPost" class="btn-users">SignIn</button>
                <button @click="LogoutPost" class="btn-users">Logout</button>
                <button @click="RefreshPost" class="btn-users">Refresh</button>
            </div>
            <div>
                <table class="user-table">
                    <thead class="thead-bg">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Username</th>
                            <th scope="col">Email</th>
                        </tr>
                    </thead>
                    <!-- <tbody v-for="(user, index) in users" :key="index">
                        <tr>
                            <th scope="row">{{ user.id }}</th>
                            <td>{{ user.name }}</td>
                            <td>{{ user.username }}</td>
                            <td>{{ user.email }}</td>
                        </tr>
                    </tbody> -->
                </table>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import axios from 'axios';

export default {
  name: "GetPage",
  data() {
    return {
      users: [],
      loading: false,
      AccessToken: '',
      RefreshToken: ''
    };
  },
  methods: {
    async SignUpPost() {
        const result = await axios.post('http://localhost:3000/api/auth/local/signup', {
            email: 'email',
            password: 'password',
            orders: [1, 2, 3]
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((response) => {
            console.log(response);
            this.AccessToken = response.data.access_token;
            this.RefreshToken = response.data.refresh_token;
        })
        .catch((error) => {
            console.log(error)
        })
        console.log(result);
    },
    async SignInPost() {
        const result = await axios.post('http://localhost:3000/api/auth/local/signin', {
            email: 'email',
            password: 'password',
            orders: [1, 2, 3]
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((response) => {
            console.log(response);
            this.AccessToken = response.data.access_token;
            this.RefreshToken = response.data.refresh_token;
        })
        .catch((error) => {
            console.log(error)
        })
        console.log(result);
    },
    LogoutPost() {
        const logout = axios.create({
            baseURL: 'http://localhost:3000/',
            timeout: 1000,
            headers: {'Authorization': `Bearer ${this.AccessToken}`}
        });
        logout.post('api/auth/logout')
            .then(function (response) {
                console.log(response)
            })
            .catch(function (error) {
                console.log(error)
        })
    },
    RefreshPost() {
        const refresh = axios.create({
            baseURL: 'http://localhost:3000/',
            timeout: 1000,
            headers: {'Authorization': `Bearer ${this.RefreshToken}`}
        });
        refresh.post('api/auth/refresh')
            .then(function (response) {
                console.log(response)
            })
            .catch(function (error) {
                console.log(error)
        })
    }
  },
};
</script>

<style>
.fetch-profile {
    display: flex;
    justify-content: center;
    width: 90%;
    padding: 30px;
}

.thead-bg {
    background-color: rgb(221, 220, 220);
}

.btn-users {
    background-color: #000;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
}

.user-table {
    border-collapse: collapse;
    width: 100%;
}

.user-table td,
.user-table th {
    border: 1px solid #ddd;
    padding: 8px;
}

.user-table tr:nth-child(even) {
    background-color: #f2f2f2;
}

.user-table tr:hover {
    background-color: #ddd;
}

.user-table th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: rgb(221, 220, 220);
    color: rgb(49, 49, 49);
}
</style>