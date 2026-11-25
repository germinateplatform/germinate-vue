<template>
  <BaseChart
    :title="$t('pageStatisticsWordcloudTitle')"
    :chart-id="id"
    chart-type="svg"
    filename="wordcloud"
    :supports-png-download="false"
    :header-icon="mdiCloudTags"
    header-icon-color="primary"
    :supports-file-download="false"
    :toolbar-color="''"
    @force-redraw="renderCloud"
  >
    <template #chart-content>
      <p>{{ $t('pageStatisticsWordcloudText') }}</p>
      <div :id="id" ref="container" class="word-cloud">
        <svg
          v-if="placedWords.length > 0"
          class="word-cloud__svg"
          role="img"
          aria-label="Word cloud"
          :viewBox="`0 0 ${container?.clientWidth ?? 0} ${container?.clientHeight ?? 0}`"
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            v-for="(word, index) in placedWords"
            :key="`${word.text}-${index}`"
            :transform="`
              translate(
                ${word.x + (container?.clientWidth ?? 0) / 2},
                ${word.y + (container?.clientHeight ?? 0) / 2}
              )
              rotate(${word.rotate})
            `"
            text-anchor="middle"
            dominant-baseline="auto"
            :font-size="word.size"
            font-family="Arial, sans-serif"
            font-weight="600"
            :fill="getColor(word.datum, index)"
            class="word-cloud__word"
            :style="{
              // Apply a dynamic glow filter when hovered
              filter: hoveredIndex === index ? `drop-shadow(0 0 5px ${getColor(word.datum, index)}` : 'none',
              opacity: hoveredIndex !== undefined && hoveredIndex !== index ? 0.5 : 1,
            }"
            @click="handleWordClick(word.datum)"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = undefined"
          >
            <title>{{ `${word.text}: ${word.datum.count}` }}</title>
            {{ word.text }}
          </text>
        </svg>
      </div>
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'
  import { uuidv4 } from '@/plugins/util'
  import { createMultiColorGradient, getTemplateColors, GRADIENT_VIRIDIS } from '@/plugins/util/colors'
  import { mdiCloudTags } from '@mdi/js'
  import CloudLayout from 'd3-cloud'

  const router = useRouter()
  const id = ref('wordcloud-' + uuidv4())
  const colors = ref<string[]>([])

  export interface WordItemObject {
    text: string
    count: number
  }

  export type WordItem = WordItemObject

  interface Props {
    words: WordItem[]
    colorMode?: 'gradient' | 'random'
  }

  const props = withDefaults(defineProps<Props>(), {
    colorMode: 'random',
  })

  interface PlacedWord {
    text: string
    x: number
    y: number
    rotate: number
    size: number
    datum: WordItemObject
  }

  const container = ref<HTMLDivElement | null>(null)
  const placedWords = ref<PlacedWord[]>([])
  const hoveredIndex = ref<number>()
  const minValue = ref<number>()
  const maxValue = ref<number>()

  let resizeObserver: ResizeObserver | undefined

  function normalizeWords (words: WordItem[]): WordItemObject[] {
    return words
      .map((item): WordItemObject => {
        if (Array.isArray(item)) {
          return {
            text: item[0],
            count: item[1],
          }
        }

        return item
      })
      .filter(item =>
        item.text.trim().length > 0
        && Number.isFinite(item.count)
        && item.count > 0,
      )
  }

  function getFontSize (
    value: number,
    minValue: number,
    maxValue: number,
  ): number {
    const minSize = 14
    const maxSize = 150

    if (minValue === maxValue) {
      return 28
    }

    // Square-root scaling prevents large frequencies
    // from dominating the entire word cloud.
    const min = Math.sqrt(minValue)
    const max = Math.sqrt(maxValue)
    const current = Math.sqrt(value)

    return Math.round(
      minSize + ((current - min) / (max - min)) * (maxSize - minSize),
    )
  }

  function handleWordClick (word: WordItemObject) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'datasetName',
        comparator: FilterComparator.contains,
        values: [word.text],
      }, {
        column: 'datasetDescription',
        comparator: FilterComparator.contains,
        values: [word.text],
      }],
      operator: FilterOperator.or,
    }]

    // Then redirect to the datasets page
    router.push({
      path: Pages.datasets.path,
      query: {
        'datasets-filter': JSON.stringify(filter),
      },
    })
  }

  function getColor (word: WordItem, index: number) {
    if (props.colorMode === 'random') {
      return colors.value[index % colors.value.length]
    } else {
      return colors.value[word.count - (minValue.value ?? 0)]
    }
  }

  function renderCloud (): void {
    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    if (!width || !height) return

    const words = normalizeWords(props.words)

    if (words.length === 0) {
      placedWords.value = []
      return
    }

    minValue.value = Math.min(...words.map(w => w.count))
    maxValue.value = Math.max(...words.map(w => w.count))

    if (props.colorMode === 'random') {
      colors.value = getTemplateColors()
    } else {
      const range = maxValue.value - minValue.value
      colors.value = createMultiColorGradient(GRADIENT_VIRIDIS, range + 1)
    }

    // Largest words are placed first.
    const sortedWords = [...words].sort(
      (a, b) => b.count - a.count,
    )

    const layout = new CloudLayout()
      .size([width, height])
      .overflow(false)

    const placed: PlacedWord[] = []

    for (const word of sortedWords) {
      const fontSize = getFontSize(
        word.count,
        minValue.value,
        maxValue.value,
      )

      const sprite = layout.getSprite(word.text, {
        font: 'sans-serif',
        weight: '600',
        size: fontSize,
        padding: 1,
        rotate: 0,
        datum: word,
      })

      if (!sprite) continue

      const result = layout.place(sprite)

      if (result) {
        placed.push(result as PlacedWord)
      }
    }

    placedWords.value = placed
  }

  onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
      renderCloud()
    })

    if (container.value) {
      resizeObserver.observe(container.value)
    }

    renderCloud()
  })

  watch(
    () => props.words,
    () => renderCloud(),
    { deep: true },
  )

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
  })
</script>

<style scoped>
.word-cloud {
  width: 100%;
  height: clamp(220px, 55vw, 520px);
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.word-cloud__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.word-cloud__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.word-cloud__word {
  cursor: pointer;
  transition: filter 0.15s ease, opacity 0.15s ease;
}
</style>
