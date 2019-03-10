<template>
<div class="app">
	<ul>
		<li><router-link to="/">エントランス</router-link></li>
		<li><router-link to="/theme">テーマ一覧</router-link></li>
	</ul>
	<div class="container">
		<router-view></router-view>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({ components: { } })
export default class extends Vue {

}
</script>

<style lang="scss">
html {
	font-size: 14px;
}
body {
	background-color: hsl(0, 0%, 95%);
	color: hsl(0, 0%, 20%);
}
</style>

<style lang="scss" scoped>
.app {
	ul {
		list-style: none;
		padding-left: 0;

		li {
			display: inline-block;
		}
	}
}
</style>
