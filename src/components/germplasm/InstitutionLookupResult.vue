<template>
  <!-- Result of looking up an institute code on FAO WIEWS, under its field on the passport page -->
  <div class="institution-lookup" aria-live="polite">
    <div class="institution-lookup-loading" v-if="lookup.status === 'loading'">
      <b-spinner small /> Looking up {{ lookup.code }} on FAO WIEWS …
    </div>
    <template v-else-if="lookup.status === 'found'">
      <div class="institution-lookup-name" :title="lookup.name">{{ lookup.name }}</div>
      <div class="institution-lookup-address" v-if="lookup.address" :title="lookup.address">{{ lookup.address }}</div>
    </template>
    <div class="institution-lookup-error" v-else-if="lookup.status === 'notfound'">{{ lookup.message }}</div>
  </div>
</template>

<script>
export default {
  props: {
    // { status: 'loading' | 'found' | 'notfound', code, name, address, message }
    lookup: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.institution-lookup {
  margin-top: 0.15rem;
  min-width: 0;
}
.institution-lookup-name,
.institution-lookup-address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.institution-lookup-name {
  font-weight: 600;
}
.institution-lookup-address,
.institution-lookup-loading {
  color: var(--cp-muted, #6b6f6c);
  font-size: 0.85rem;
}
.institution-lookup-error {
  color: var(--danger, #dc3545);
  font-size: 0.85rem;
}
</style>
