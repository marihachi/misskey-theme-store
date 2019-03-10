import Entrance from './components/pages/entrance.vue';
import Themes from './components/pages/themes.vue';
import Theme from './components/pages/theme.vue';
//import Users from './components/pages/users.vue';
import User from './components/pages/user.vue';
import NotFound from './components/pages/notFound.vue';

export default [
	{ path: '/', component: Entrance },
	{ path: '/theme', component: Themes, props: (route: any) => ({ query: route.query.q }) },
	{ path: '/theme/:themeId', component: Theme },
	//{ path: '/user', component: Users, props: (route: any) => ({ query: route.query.q }) },
	{ path: '/user/:username', component: User },
	{ path: '*', component: NotFound }
];
