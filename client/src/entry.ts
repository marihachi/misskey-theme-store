import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
import App from './components/app.vue';

import 'normalize.css';

Vue.use(VueRouter);
const router = new VueRouter({ routes: routes, mode: 'history' });

const app = new Vue({
	el: '#app',
	router: router,
	components: { App },
	template: '<App></App>'
});
