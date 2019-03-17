import Vue from 'vue';
import store from './store';
import router from './router';
import App from './components/app.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
	faUser,
	faPalette,
	faSignInAlt,
	faUserPlus,
	faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

import 'normalize.css';

// * font awesome
library.add(
	faUser,
	faPalette,
	faSignInAlt,
	faUserPlus,
	faSignOutAlt
);
Vue.component('fa', FontAwesomeIcon);

const app = new Vue({
	el: '#app',
	store: store(),
	router: router(),
	components: { App },
	template: '<App/>'
});

app.$store.dispatch('loadSession');
