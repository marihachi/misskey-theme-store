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

app.$store.dispatch('loadSession');
