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
import axios from 'axios';
import { sessionModule } from '../store';

@Component({ components: { } })
export default class extends Vue {
	username: string = '';
	password: string = '';

	async signin() {
		const result = await axios.post(`/signin`, {
			username: this.username,
			password: this.password
		});

		if (result.status != 200) {
			console.error(result.data);
			alert('ログインに失敗しました');
			return;
		}

		const userId = result.data.result.userId;
		const token = result.data.result.token;
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
