import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import StorePart from './utils/StorePart';

export default () => {
	Vue.use(Vuex);

	const sessionStorePart = new StorePart({
		state: {
			session: null as { user: { [x: string]: any }, token: string } | null
		},
		mutations: {
			setSession(state, payload) {
				if (!payload.user || !payload.token) {
					throw new Error('invalid payload');
				}
				state.session = {
					user: payload.user,
					token: payload.token
				};
			},
			clearSession(state) {
				state.session = null;
			}
		},
		actions: {
			async setSession({ commit }, payload) {
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
			clearSession({ commit }) {
				commit('clearSession');
				localStorage.removeItem('userId');
				localStorage.removeItem('token');
			},
			async loadSession({ commit, state }, payload) {
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
	});

	const themeStorePart = new StorePart({
		state: {
			themes: [] as { [x: string]: any }[],
			themesFetched: false as boolean
		},
		mutations: {
			setThemes(state, payload) {
				if (!payload.themes) {
					throw new Error('invalid payload');
				}
				state.themes = payload.themes;
			},
			setThemesFetched(state) {
				state.themesFetched = true;
			},
			clearThemes(state) {
				state.themes = [];
				state.themesFetched = false;
			}
		},
		actions: {
			async fetchThemes({ commit }) {
				const result = await axios.post('/theme/list', { });
				if (result.status != 200) {
					throw new Error(result.data.error.reason);
				}
				const themes = result.data.result;
				commit('setThemes', { themes });
				commit('setThemesFetched');
			}
		}
	});

	const store = new Vuex.Store({
		state: {
			...sessionStorePart.state as any,
			...themeStorePart.state as any
		},
		mutations: {
			...sessionStorePart.mutations as any,
			...themeStorePart.mutations as any
		},
		actions: {
			...sessionStorePart.actions as any,
			...themeStorePart.actions as any
		}
	});

	return store;
};
