<template>
<div class="signin">
	<p>ログイン</p>
	<form @submit.prevent="signin()">
		<div>
			<input type="text" v-model="username">
		</div>
		<div>
			<input type="password" v-model="password">
		</div>
		<button type="submit">ログインする</button>
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

	async signin() {
		const res = await api(`/signin`, {
			username: this.username,
			password: this.password
		});

		if (res.error) {
			console.error(res.error);
			alert('ログインに失敗しました');
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
.signin {
	margin: 1.5rem;
}
</style>
