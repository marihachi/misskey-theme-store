import Vue from 'vue';
import store from './store';
import router from './router';
import App from './components/app.vue';

import 'normalize.css';

const app = new Vue({
	el: '#app',
	router: router(),
	store: store(),
	components: { App },
	template: '<App></App>'
});

const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

if (userId && token) {
	app.$store.commit('setSession', { userId: userId, token: token });
}
