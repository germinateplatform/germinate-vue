<template>
  <div class="v-input--indent-details">
    <slot />
    <div class="v-input__details" role="alert" aria-live="polite">
      <div class="v-messages">
        <div class="v-messages__message">
          {{ $t(text) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const compProps = defineProps<{
    text: string
  }>()
</script>
