<template>
  <v-card
    :model-value:loading="localLoading"
    @update:loading="notifyLoading"
  >
    <v-toolbar density="comfortable" color="surface" :title="compProps.title ? $t(compProps.title) : undefined">
      <slot name="toolbar-prepend" />
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical" />
        </template>

        <v-list>
          <slot name="list-prepend" />
          <v-list-item @click="downloadChart('png')" :title="$t('buttonDownloadPng')" prepend-icon="mdi-file-image" v-if="compProps.supportsPngDownload" />
          <v-list-item @click="downloadChart('svg')" :title="$t('buttonDownloadSvg')" prepend-icon="mdi-file-code" v-if="compProps.supportsSvgDownload" />
          <v-list-item @click="downloadSource" :title="$t('buttonDownloadFile')" prepend-icon="mdi-file-document" v-if="compProps.supportsFileDownload" />
          <v-list-item @click="bottomSheetVisible = true" :title="$t('buttonChangeChartColors')" prepend-icon="mdi-palette" v-if="compProps.canChangeColors" />
          <slot name="list-append" />
        </v-list>
      </v-menu>
      <slot name="toolbar-append" />
    </v-toolbar>

    <v-card-text>
      <slot name="chart-content" ref="chart" />
    </v-card-text>

    <v-card-actions>
      <slot name="card-actions" />
    </v-card-actions>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      persistent
      max-height="75vh"
    >
      <v-card
        :title="$t('modalTitleChartColors')"
        class="pb-10"
      >
        <v-card-text>
          <v-btn class="mb-3" prepend-icon="mdi-undo-variant" :text="$t('buttonResetColorsToDefault')" @click="resetToDefault" />
          <v-row>
            <v-col cols="12" md="6">
              <VColorInput
                hide-actions
                v-model="newColor"
                append-icon="mdi-plus"
                @click:append="addColor"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-chip
                label
                closable
                class="me-2 mb-2"
                variant="flat"
                v-for="(color, index) in colors"
                :key="`color-${color}-${index}`"
                :color="color"
                :text="color"
                @click:close="removeColor(index)"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn :text="$t('buttonCancel')" @click="bottomSheetVisible = false" />
          <v-btn :text="$t('buttonSave')" color="primary" variant="tonal" :disabled="colors.length === 0" @click="saveColors" />
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script lang="ts" setup>
  import { downloadBlob, downloadSvgsFromContainer, type DownloadBlob } from '@/plugins/util'
  import { getDateTimeString } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import Plotly from 'plotly.js/lib/core'
  import { VColorInput } from 'vuetify/labs/VColorInput'

  const emit = defineEmits(['update:loading', 'force-redraw', 'download-png-manually'])

  interface ChartProps {
    loading?: boolean
    title?: string
    downloadWidth?: number
    downloadHeight?: number
    supportsSvgDownload?: boolean
    supportsPngDownload?: boolean
    supportsFileDownload?: boolean
    filename: string
    sourceFile?: DownloadBlob
    chartType?: 'plotly' | 'd3.js'
    canChangeColors?: boolean
    chartId: string
  }

  const compProps = withDefaults(defineProps<ChartProps>(), {
    loading: false,
    downloadWidth: 1280,
    downloadHeight: 600,
    supportsPngDownload: true,
    supportsSvgDownload: true,
    supportsFileDownload: true,
    chartType: 'plotly' as const,
    canChangeColors: true,
  })

  const store = coreStore()

  const bottomSheetVisible = ref(false)
  const localLoading = ref(false)
  const colors = ref<string[]>([])
  const newColor = ref('#ffffff')

  watch(() => compProps.loading, async (newValue: boolean) => {
    localLoading.value = newValue
  })

  function notifyLoading (value: boolean) {
    emit('update:loading', value)
  }

  function addColor () {
    colors.value.push(newColor.value)
  }

  function downloadChart (imageType: string) {
    const element = document.querySelector(`#${compProps.chartId}`)

    if (element) {
      if (imageType === 'svg') {
        downloadSvgsFromContainer(element, compProps.chartType === 'plotly', compProps.filename + '-' + getDateTimeString())
      } else if (imageType === 'png') {
        if (compProps.chartType === 'd3.js') {
          emit('download-png-manually')
        } else {
          const chart = element.classList.contains('js-plotly-plot') ? element : element.querySelector('.js-plotly-plot')
          if (chart) {
            // @ts-ignore
            Plotly.downloadImage(chart, { format: 'png', width: compProps.downloadWidth, height: compProps.downloadHeight, filename: compProps.filename + '-' + getDateTimeString() })
          }
        }
      }
    }
  }

  function downloadSource () {
    const request = compProps.sourceFile

    if (!request) {
      return
    }

    request.filename = request.filename + '-' + getDateTimeString()

    if (!request.extension) {
      request.extension = 'txt'
    }

    downloadBlob(request)
  }

  function removeColor (index: number) {
    colors.value.splice(index, 1)
  }

  function updateColors () {
    colors.value = store.storeChartColors
  }

  function resetToDefault () {
    console.log(store.storeServerSettings?.colorsCharts)
    colors.value = store.storeServerSettings?.colorsCharts || store.storeChartColors
  }

  function saveColors () {
    store.setCustomChartColors(colors.value)
    bottomSheetVisible.value = false
  }

  watch(() => store.storeTheme, async () => {
    nextTick(() => emit('force-redraw'))
  })
  watch(() => store.storeChartColors, async () => {
    updateColors()
    nextTick(() => emit('force-redraw'))
  })
  watch(bottomSheetVisible, async (newValue: boolean) => {
    if (newValue) {
      updateColors()
    }
  })

  onMounted(() => {
    updateColors()
  })
</script>
