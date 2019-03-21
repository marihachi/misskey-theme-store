import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

export default () => {
	Vue.use(Vuex);

	const sessionStore = {
		state: {
			session: null as { user: { [x: string]: any }, token: string } | null
		},
		mutations: {
			setSession(state: any, payload: any) {
				if (!payload.user || !payload.token) {
					throw new Error('invalid payload');
				}
				state.session = {
					user: payload.user,
					token: payload.token
				};
			},
			clearSession(state: any) {
				state.session = null;
			}
		},
		actions: {
			async setSession({ commit }: any, payload: any) {
				payload = payload || {};
				const userId = payload.userId;
				const token = payload.token;
				if (!userId || !token) {
					throw new Error('invalid payload');
				}
				const result = await axios.post('/user/get', { userId });
				if (result.status != 200) {
					throw new Error(result.data.error.reason);
				}
				const user = result.data.result;
				commit('setSession', { user, token });
				localStorage.setItem('userId', userId);
				localStorage.setItem('token', token);
			},
			clearSession({ commit }: any) {
				commit('clearSession');
				localStorage.removeItem('userId');
				localStorage.removeItem('token');
			},
			async loadSession({ commit, state }: any, payload: any) {
				payload = payload || {};
				if (!payload.force && state.session != null) {
					return true;
				}
				const userId = localStorage.getItem('userId');
				const token = localStorage.getItem('token');
				if (!userId || !token) {
					return false;
				}
				const result = await axios.post('/user/get', { userId });
				if (result.status != 200) {
					throw new Error(result.data.error.reason);
				}
				const user = result.data.result;
				commit('setSession', { user, token });
				return true;
			}
		}
	};

	const themeStore = {
		state: {
			themes: [] as { [x: string]: any }[],
			themesFetched: false as boolean
		},
		mutations: {
			setThemes(state: any, payload: any) {
				if (!payload.themes) {
					throw new Error('invalid payload');
				}
				state.themes = payload.themes;
			},
			setThemesFetched(state: any) {
				state.themesFetched = true;
			},
			clearThemes(state: any) {
				state.themes = [];
				state.themesFetched = false;
			}
		},
		actions: {
			async fetchThemes({ commit }: any) {
				const result = await axios.post('/theme/list', { });
				if (result.status != 200) {
					throw new Error(result.data.error.reason);
				}
				const themes = result.data.result;
				commit('setThemes', { themes });
				commit('setThemesFetched');
			}
		}
	};

	const store = new Vuex.Store({
		state: {
			...sessionStore.state,
			...themeStore.state
		},
		mutations: {
			...sessionStore.mutations,
			...themeStore.mutations
		},
		actions: {
			...sessionStore.actions,
			...themeStore.actions
		}
	});

	return store;
};
