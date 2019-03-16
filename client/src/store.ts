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
		getters: {
			session: state => state.session
		}
	});

	return store;
};
