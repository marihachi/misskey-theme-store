<template>
<p>router</p>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
//import EntrancePage from './pages/entrance.vue';

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
