<template>
<div class="app">
	<div class="global-nav">
		<div class="left">
			<ul>
				<li><router-link to="/"><fa icon="palette" />テーマ一覧</router-link></li>
			</ul>
		</div>
		<div class="center">
			<div>
				<fa class="icon" icon="paint-brush" />
			</div>
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
	background-color: hsl(25, 100%, 96%);
	color: hsl(25, 72%, 46%);
}
</style>

<style lang="scss" scoped>
.app {
	.global-nav {
		display: flex;
		background-color: hsl(22, 33%, 76%);
		height: 3.5rem;
		a {
			color: hsl(20, 70%, 37%);
			text-decoration: none;
		}
		.left, .right, .center {
			> * {
				display: flex;
				align-items: center;
				padding: 0;
				margin: 0;
				height: 100%;
			}
			> ul {
				list-style: none;
				li {
					a {
						display: inline-flex;
						align-items: center;
						padding: 0 2rem;
						cursor: pointer;
						height: 100%;
					}
				}
			}
		}
		.left {
			margin-right: auto;
		}
		.right {
			margin-left: auto;
		}
		.center {
			.icon {
				font-size: 1.4rem;
			}
		}
	}
}
</style>
