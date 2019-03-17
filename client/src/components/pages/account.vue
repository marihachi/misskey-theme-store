<template>
<div class="account-page" >
	<div v-if="accountUser">
		<p>username: {{accountUser.username}}</p>

		<label for="theme-file" class="file-select">
			テーマをアップロード
			<input type="file" id="theme-file" @change="e => onFileChanged(e)" accept=".misskeytheme">
		</label>
	</div>
	<div v-else-if="loading">
		<p>loading ...</p>
	</div>
	<div v-else>
		<p>failed to fetch account info</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

const readFile = (file: Blob) => new Promise<any>((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = (e) => {
		resolve(reader.result);
	};
	reader.onerror = (e) => {
		reject(new Error('file read error'));
	};
	reader.readAsText(file);
});

@Component({ components: { } })
export default class extends Vue {
	loading: boolean = true;
	accountUser: any = null;

	async created() {
		await this.$store.dispatch('loadSession');
		const session = this.$store.state.session;
		if (!session) {
			this.loading = false;
			return;
		}

		const result = await axios.post('/user/get', { userId: session.userId });
		if (result.status != 200) {
			this.loading = false;
			console.error(result.data);
			alert('アカウント情報の取得に失敗しました');
			return;
		}
		this.accountUser = result.data.result;
		this.loading = false;
	}

	async onFileChanged(e: any) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const text = await readFile(file);
		console.log(text);
	}
}
</script>

<style lang="scss" scoped>
.account-page {
	margin: 1.5rem;
	.file-select {
		display: block;
		padding: 1rem;
		width: 12rem;
		border: 2px solid hsla(0, 100%, 50%, 0.4);
		border-radius: 2rem;
		text-align: center;
		cursor: pointer;
		input {
			display: none;
		}
	}
}
</style>
