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

async function entry() {
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
		store: store(),
		router: router(),
		components: { App },
		template: '<App/>'
	});

	console.log('loading session ...');
	try {
		await app.$store.dispatch('loadSession');
	}
	catch (err) {
		if (err.message == 'no_session') { }
	}

	console.log('mouting app ...');
	app.$mount('#app');
};

entry()
.catch(err => {
	console.error(err);
});
