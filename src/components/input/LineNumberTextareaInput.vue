<template>
  <div class="d-flex">
    <v-textarea
      class="line-number-comp flex-grow-0"
      :model-value="numbers"
      readonly
      label="&nbsp;"
      no-resize
      :style="{ width: `${gutterWidth}em` }"
      ref="gutter"
    />
    <v-textarea
      class="input-comp flex-grow-1"
      v-bind="$attrs"
      v-model="model"
      ref="input"
      counter
      :counter-value="() => nonEmptyLines"
      persistent-counter
    />
  </div>
</template>

<script setup lang="ts">
  import { useScroll } from '@vueuse/core'

  const gutter = useTemplateRef('gutter')
  const input = useTemplateRef('input')

  function getScrollTarget () {
    return input.value?.$el?.querySelector('textarea')
  }

  const scrollTarget = computed(getScrollTarget)

  const { y } = useScroll(scrollTarget)

  const model = defineModel<string>({ default: '' })

  const nonEmptyLines = computed(() => {
    return (lines.value || []).filter(s => s && s.length > 0).length
  })

  const lines = computed(() => {
    return model.value.split(/\r?\n/)
  })

  const numbers = computed(() => {
    return lines.value.map((_, i) => `${i + 1}`).join('\n')
  })

  const gutterWidth = computed(() => Math.max(2, `${lines.value.length}`.length))

  watch(y, async newValue => {
    if (gutter.value) {
      gutter.value.scrollTop = newValue
    }
  })
</script>

<style scoped>
.line-number-comp {
  overflow: hidden;
  pointer-events: none;
}

.line-number-comp :deep(.v-field__input) {
  overflow: hidden;
  padding-right: 8px;
  padding-left: 4px;
  text-align: end;
}

.line-number-comp :deep(.v-field__overlay) {
  border-top-right-radius: 0;
}
.input-comp :deep(.v-field__overlay) {
  border-top-left-radius: 0;
}
.line-number-comp :deep(textarea) {
  border-inline-end-width: thin;
  border-inline-end-style: solid;
  border-inline-end-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
