import Vue from 'vue';
import VueRouter from 'vue-router';

// * import vue components
import Signin from './components/pages/signin.vue';
import Themes from './components/pages/themes.vue';
import Theme from './components/pages/theme.vue';
//import Users from './components/pages/users.vue';
import User from './components/pages/user.vue';
import NotFound from './components/pages/notFound.vue';

export default () => {
	Vue.use(VueRouter);

	const router = new VueRouter({
		routes: [
			{ path: '/', component: Themes, props: (route: any) => ({ query: route.query.q }) },
			{ path: '/signin', component: Signin },
			{ path: '/theme/:themeId', name: 'themeDetail', component: Theme },
			//{ path: '/user', component: Users, props: (route: any) => ({ query: route.query.q }) },
			{ path: '/user/:username', name: 'userDetail', component: User },
			{ path: '*', component: NotFound }
		],
		mode: 'history'
	});

	return router;
};
