<template>
<div class="signup">
	<p>アカウントの登録</p>
	<form @submit.prevent="signup()">
		<div class="text-box">
			<span class="label">ユーザー名</span>
			<input type="text" v-model="username">
		</div>
		<div class="text-box">
			<span class="label">パスワード</span>
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

	form {
		.text-box {
			width: 16rem;
			margin: 0.5rem 0;

			.label {
				font-size: 0.8rem;
			}

			input {
				background-color: hsla(0, 0%, 100%, 0);
				border: none;
				width: 100%;
				padding: 0.4rem;
				outline: 0;
				border-bottom: 1px solid hsla(36, 100%, 50%, 0.57);
			}
		}

		button {
			border: none;
			padding: 0.6rem;
			outline: 0;
			width: 10rem;
			background-color: hsl(25, 76%, 63%);
			color: hsl(0, 0%, 100%);
			border-radius: 0.8rem;
			text-align: center;
		}
	}
}
</style>
