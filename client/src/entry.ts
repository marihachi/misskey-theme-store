import Vue from 'vue';
import Router from './components/router.vue';

const vue = new Vue({
	el: '#app',
	components: {
		mtsRouter: Router
	}
});
