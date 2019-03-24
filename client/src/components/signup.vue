<template>
<div class="signup">
	<p>アカウントの登録</p>
	<form @submit.prevent="signup()">
		<div>
			<input type="text" v-model="username">
		</div>
		<div>
			<input type="password" v-model="password">
		</div>
		<button type="submit">登録する</button>
	</form>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import api from '../utils/requestApi';
import { sessionModule } from '../store';

@Component({ components: { } })
export default class extends Vue {
	username: string = '';
	password: string = '';

	async signup() {
		const res = await api(`/signup`, {
			username: this.username,
			password: this.password
		});

		if (res.error) {
			console.error(res.error);
			alert('登録に失敗しました');
			return;
		}

		const userId = res.result.userId;
		const token = res.result.token;
		await sessionModule.setSession({ userId, token });
		this.$router.push({ path: '/account' });
	}
}
</script>

<style lang="scss" scoped>
.signup {
	margin: 1.5rem;
}
</style>
