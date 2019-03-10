<template>
<div>
	<p>theme list</p>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({ components: { } })
export default class extends Vue {
	@Prop()
	query!: string;
}
</script>

<style lang="scss">

</style>
