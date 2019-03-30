<template>
<div class="account-page" >
	<div v-if="accountUser">
		<p>@{{accountUser.username}}</p>

		<label for="theme-file" class="file-select button">
			テーマをアップロード
			<input type="file" id="theme-file" @change="e => onFileChanged(e)" accept=".misskeytheme">
		</label>
	</div>
	<div v-else>
		<p>ログインしてください</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import api from '../../utils/requestApi';
import { sessionModule } from '../../store';
import { Theme } from '../../store/theme';

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

	get accountUser() {
		if (!sessionModule.session) {
			return null;
		}
		return sessionModule.session.user;
	}

	async onFileChanged(e: any) {
		if (!sessionModule.session) {
			return;
		}

		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const text = await readFile(file);
		console.log(text);

		const res = await api('/theme/register', {
			token: sessionModule.session.token,
			themeData: text
		});
		if (res.error) {
			console.error(res.error);
			alert('テーマファイルの登録に失敗しました');
			return;
		}
		const theme: Theme = res.result;
	}
}
</script>

<style lang="scss" scoped>
.account-page {
	margin: 1.5rem;

	.file-select {
		input {
			display: none;
		}
	}
}
</style>
