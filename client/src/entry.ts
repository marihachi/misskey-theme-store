import Vue from 'vue';
import VueRouter from 'vue-router';
import Entrance from './components/entrance.vue';
import User from './components/user.vue';

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{ path: '/', component: Entrance },
		{ path: '/user', component: User }
	]
});

const app = new Vue({
	el: '#app',
	router: router,
	template: '<router-view></router-view>'
});
