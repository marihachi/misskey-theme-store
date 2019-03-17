<template>
<div class="not-found-page">
	<p>ページが見つかりません</p>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({ components: { } })
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
.not-found-page {
	margin: 1.5rem;
}
</style>
