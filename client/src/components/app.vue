<template>
<div class="app">
	<div class="global-nav">
		<div class="left">
			<ul>
				<li><router-link to="/"><fa icon="palette" />テーマ一覧</router-link></li>
			</ul>
		</div>
		<div class="right">
			<ul v-if="isLogin">
				<li><router-link to="/account"><fa icon="user" />アカウントページ</router-link></li>
				<li><a @click="logout()"><fa icon="sign-out-alt" />ログアウト</a></li>
			</ul>
			<ul v-else>
				<li><router-link to="/signin"><fa icon="sign-in-alt" />ログインと登録</router-link></li>
			</ul>
		</div>
	</div>
	<div class="container">
		<router-view></router-view>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { sessionModule } from '../store';

@Component({ components: { } })
export default class extends Vue {
	get isLogin() {
		return sessionModule.session != null;
	}

	async logout() {
		sessionModule.clearSession();
		if (this.$router.currentRoute.path =='/account') {
			this.$router.push({ path: '/' });
		}

	}
}
</script>

<style lang="scss">
html {
	font-size: 14px;
}
body {
	background-color: hsl(11, 100%, 97%);
	color: hsl(0, 44%, 57%);
}
</style>

<style lang="scss" scoped>
.app {
	.global-nav {
		display: flex;
		background-color: hsl(22, 33%, 76%);
		.left, .right {
			ul {
				list-style: none;
				padding-left: 0;
				margin: 0;
				li {
					display: inline-block;
					a {
						display: inline-block;
						padding: 1.2rem 2.4rem;
						cursor: pointer;
					}
				}
			}
		}
		.right {
			margin-left: auto;
		}
	}
}
</style>
