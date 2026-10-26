<template>
  <div ref="rootRef" class="smart-tick-slider">
    <v-slider
      v-model="modelValue"
      v-bind="$attrs"
      :min="sliderMin"
      :max="sliderMax"
      :ticks="tickValues"
      show-ticks="always"
    >
      <template #tick-label="{ tick }">
        <span
          class="smart-tick-label"
          :data-tick-value="tick.value"
          :style="{ visibility: hiddenValues.has(tick.value) ? 'hidden' : 'visible' }"
        >
          {{ labelFor(tick.value) }}
        </span>
      </template>

      <template
        v-for="name in passthroughSlotNames"
        :key="name"
        #[name]="slotProps"
      >
        <slot :name="name" v-bind="slotProps" />
      </template>
    </v-slider>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  export interface SliderTick {
    value: number
    label: string
  }

  interface Props {
    /**
     * Full set of tick positions + labels. Does not need to be evenly spaced.
     * e.g. [{ value: 0, label: 'Low' }, { value: 100, label: 'High' }]
     */
    ticks: SliderTick[]
    /** Minimum pixel gap required between two adjacent visible labels. */
    minGap?: number
    /**
     * Keep the first/last tick label visible whenever there's room for them,
     * even if that means dropping a label somewhere in the middle first.
     */
    alwaysShowEndpoints?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    minGap: 8,
    alwaysShowEndpoints: true,
  })

  const modelValue = defineModel<number>()

  const sortedTicks = computed<SliderTick[]>(() =>
    [...props.ticks].sort((a, b) => a.value - b.value),
  )
  const tickValues = computed<number[]>(() => sortedTicks.value.map(t => t.value))
  const sliderMin = computed<number>(() => sortedTicks.value[0]?.value ?? 0)
  const sliderMax = computed<number>(
    () => sortedTicks.value[sortedTicks.value.length - 1]?.value ?? 0,
  )

  const labelMap = computed<Map<number, string>>(() => {
    const map = new Map<number, string>()
    for (const t of sortedTicks.value) map.set(t.value, t.label)
    return map
  })
  function labelFor (value: number): string {
    return labelMap.value.get(value) ?? ''
  }

  // Forward every slot except the one we implement ourselves.
  const slots = useSlots()
  const passthroughSlotNames = computed<string[]>(() =>
    Object.keys(slots).filter(name => name !== 'tick-label'),
  )

  const rootRef = ref<HTMLElement | null>(null)
  const hiddenValues = ref<Set<number>>(new Set())

  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  function scheduleRecompute (): void {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(recomputeVisibility)
  }

  interface LabelBox {
    value: number
    left: number
    right: number
  }

  function recomputeVisibility (): void {
    const root = rootRef.value
    if (!root) return

    const labelEls = Array.from(
      root.querySelectorAll<HTMLElement>('.smart-tick-label'),
    )
    if (labelEls.length === 0) return

    // Reveal everything first so we measure true widths, not stale ones.
    for (const el of labelEls) el.style.visibility = 'visible'

    const boxes: LabelBox[] = labelEls
      .map(el => {
        const rect = el.getBoundingClientRect()
        return {
          value: Number(el.dataset.tickValue),
          left: rect.left,
          right: rect.right,
        }
      })
      .sort((a, b) => a.left - b.left)

    const n = boxes.length
    if (n === 0) return

    const keep = new Set<number>()
    const first = boxes[0]
    const last = boxes[n - 1]
    const forceEndpoints = props.alwaysShowEndpoints || n === 1

    if (forceEndpoints) keep.add(first.value)

    let lastRight = keep.has(first.value) ? first.right : -Infinity
    const upperBound = forceEndpoints && n > 1 ? last.left : Infinity

    // Greedy left-to-right sweep: show a label if it clears the gap from the
    // last shown label (and, when endpoints are forced, still leaves room
    // before the reserved last label).
    for (let i = 1; i < n - 1; i++) {
      const box = boxes[i]
      if (box.left - props.minGap > lastRight && box.right + props.minGap < upperBound) {
        keep.add(box.value)
        lastRight = box.right
      }
    }

    if (forceEndpoints && n > 1 && last.left - props.minGap > lastRight) {
      keep.add(last.value)
    }

    hiddenValues.value = new Set(tickValues.value.filter(v => !keep.has(v)))
  }

  onMounted(() => {
    nextTick(scheduleRecompute)
    resizeObserver = new ResizeObserver(scheduleRecompute)
    if (rootRef.value) resizeObserver.observe(rootRef.value)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  // Ticks can change at runtime (e.g. localized labels loading async).
  watch(
    () => props.ticks,
    () => nextTick(scheduleRecompute),
    { deep: true },
  )
</script>

<style scoped>
.smart-tick-slider {
  width: 100%;
}

.smart-tick-label {
  display: inline-block;
  white-space: nowrap;
  font-size: 12px;
}
</style>
