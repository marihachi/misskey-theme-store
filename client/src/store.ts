import Vue from 'vue';
import Vuex from 'vuex';

export default () => {
	Vue.use(Vuex);

	const store = new Vuex.Store({
		state: {
			session: null as { userId: string, token: string } | null
		},
		mutations: {
			setSession(state, payload) {
				if (!payload.userId || !payload.token) {
					throw new Error('invalid payload');
				}
				state.session = {
					userId: payload.userId,
					token: payload.token
				};
			},
			clearSession(state) {
				state.session = null;
			}
		},
		actions: {
			setSession({ commit }, payload) {
				const userId = payload.userId;
				const token = payload.token;
				commit('setSession', { userId, token });
				localStorage.setItem('userId', userId);
				localStorage.setItem('token', token);
			},
			clearSession({ commit }, payload) {
				commit('clearSession');
				localStorage.removeItem('userId');
				localStorage.removeItem('token');
			}
		},
		getters: {
			session(state) {
				return state.session;
			}
		}
	});

	return store;
};
