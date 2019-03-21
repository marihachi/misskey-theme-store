import { Store } from 'vuex';
import { Module, VuexModule, getModule, Mutation, Action } from 'vuex-module-decorators';
import axios from 'axios';

type Session = { user: { [x: string]: any }, token: string };
type SessionSource = { userId: string, token: string };

export default function<T> (store: Store<T>) {

	@Module({ dynamic: true, store: store, name: 'session' })
	class SessionStoreModule extends VuexModule {
		session: Session | null = null;
	
		@Mutation
		setSessionState(payload: Session) {
			if (!payload.user || !payload.token) {
				throw new Error('invalid payload');
			}
			this.session = {
				user: payload.user,
				token: payload.token
			};
		}
	
		@Mutation
		clearSessionState() {
			this.session = null;
		}
	
		@Action
		async setSession(payload: SessionSource) {
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
			this.setSessionState({ user, token });
			localStorage.setItem('userId', userId);
			localStorage.setItem('token', token);
		}
	
		@Action
		clearSession() {
			this.clearSessionState();
			localStorage.removeItem('userId');
			localStorage.removeItem('token');
		}
	
		@Action
		async loadSession(payload?: { force?: boolean }) {
			payload = payload || {};
			if (!payload.force && this.session != null) {
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
			this.setSessionState({ user, token });
			return true;
		}
	}

	return getModule(SessionStoreModule);
};
