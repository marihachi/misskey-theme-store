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
import axios from 'axios';

@Component({ components: { } })
export default class extends Vue {
	username: string = '';
	password: string = '';

	async signup() {
		const result = await axios.post(`/signup`, {
			username: this.username,
			password: this.password
		});

		if (result.status != 200) {
			console.error(result.data);
			alert('登録に失敗しました');
			return;
		}

		const userId = result.data.result.userId;
		const token = result.data.result.token;
		await this.$store.dispatch('setSession', { userId, token });
		this.$router.push({ path: '/account' });
	}
}
</script>

<style lang="scss" scoped>
.signup {
	margin: 1.5rem;
}
</style>
