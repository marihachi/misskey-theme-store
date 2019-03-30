<template>
<div class="signin">
	<p>ログイン</p>
	<form @submit.prevent="signin()">
		<div class="text-box">
			<span class="label">ユーザー名</span>
			<input type="text" v-model="username">
		</div>
		<div class="text-box">
			<span class="label">パスワード</span>
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
