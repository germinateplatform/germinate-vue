<template>
  <v-card
    :model-value:loading="localLoading"
    @update:loading="notifyLoading"
  >
    <v-toolbar density="comfortable" :color="compProps.toolbarColor">
      <v-toolbar-title class="ms-4"><v-icon size="x-small" start :color="headerIconColor" :icon="compProps.headerIcon" /> {{ compProps.title ? $t(compProps.title) : undefined }}<slot name="title-append" /></v-toolbar-title>
      <slot name="toolbar-prepend" />
      <v-menu>
        <template #activator="{ props }">
          <v-badge v-if="compProps.badgeCount" location="bottom left" color="info" :content="getNumberWithSuffix(compProps.badgeCount, 1)" :offset-x="10" :offset-y="10">
            <v-btn v-bind="props" :icon="mdiDotsVertical" />
          </v-badge>
          <v-btn v-bind="props" :icon="mdiDotsVertical" v-else />
        </template>

        <v-list>
          <slot name="list-prepend" />
          <v-list-item @click="downloadChart('png')" :title="$t('buttonDownloadPng')" :prepend-icon="mdiFileImage" v-if="compProps.supportsPngDownload" />
          <v-list-item @click="downloadChart('svg')" :title="$t('buttonDownloadSvg')" :prepend-icon="mdiFileCode" v-if="compProps.supportsSvgDownload" />
          <v-list-item @click="downloadSource" :title="$t('buttonDownloadFile')" :prepend-icon="mdiFileDocument" v-if="compProps.supportsFileDownload" />
          <v-list-item @click="bottomSheetVisible = true" :title="$t('buttonChangeChartColors')" :prepend-icon="mdiPalette" v-if="compProps.canChangeColors" />
          <slot name="list-append" />
        </v-list>
      </v-menu>
      <slot name="toolbar-append" />
    </v-toolbar>

    <slot name="card-text" />

    <v-card-text>
      <v-empty-state
        :icon="mdiFileDocumentRemove"
        :title="$t('widgetChartNoDataTitle')"
        :text="$t('widgetChartNoDataText')"
        v-if="!hasData"
      />
      <div v-show="hasData">
        <slot name="chart-content" ref="chart" />
      </div>
    </v-card-text>

    <!-- Pass on all named slots -->
    <template #actions v-if="$slots.actions">
      <slot name="actions" />
    </template>

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
          <v-btn class="mb-3" :prepend-icon="mdiUndoVariant" :text="$t('buttonResetColorsToDefault')" @click="resetToDefault" />
          <v-row>
            <v-col cols="12" md="6">
              <v-color-input
                hide-actions
                v-model="newColor"
                :append-icon="mdiPlus"
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
  import { getDateTimeString, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import { mdiChartAreaspline, mdiDotsVertical, mdiFileCode, mdiFileDocument, mdiFileDocumentRemove, mdiFileImage, mdiPalette, mdiPlus, mdiUndoVariant } from '@mdi/js'
  import Plotly from 'plotly.js/lib/core'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits(['update:loading', 'force-redraw', 'download-png-manually'])

  // 1. Define and export the interface matching your defineExpose layout
  export interface BaseChartExposed {
    register: (modules: any | any[]) => void
    purge: (el: string | HTMLElement) => void
    react: (el: string | HTMLElement, data: any, layout?: any, config?: any) => Promise<Plotly.PlotlyHTMLElement | undefined>
    restyle: (el: string | HTMLElement, update: any, indices?: number[]) => Promise<Plotly.PlotlyHTMLElement | undefined>
    relayout: (el: string | HTMLElement, update: any) => Promise<Plotly.PlotlyHTMLElement | undefined>
    downloadImage: (el: string | HTMLElement, opts?: any) => Promise<string>
  }

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
    toolbarColor?: string
    headerIconColor?: string
    headerIcon?: string
    badgeCount?: number
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
    toolbarColor: 'surface',
    headerIconColor: 'medium-emphasis',
    headerIcon: mdiChartAreaspline,
  })

  const store = coreStore()
  const { locale } = useI18n()

  const bottomSheetVisible = ref(false)
  const localLoading = ref(false)
  const colors = ref<string[]>([])
  const newColor = ref('#ffffff')
  const hasData = ref(true)

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
    colors.value = store.storeServerSettings?.colorsCharts || store.storeChartColors
  }

  function saveColors () {
    store.setCustomChartColors(colors.value)
    bottomSheetVisible.value = false
  }

  watch(locale, async () => nextTick(() => emit('force-redraw')))
  watch(() => store.storeIsDarkMode, async () => nextTick(() => emit('force-redraw')))
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

  function isEmpty (traces: any[]) {
    return traces.some((trace: any) => {
      if (!trace || typeof trace !== 'object') {
        return false
      }

      // 1. Single scalar values (e.g. Indicator charts)
      if ('value' in trace && trace.value !== null && trace.value !== undefined) {
        return true
      }

      // 2. Matrix / 2D array data (e.g. Heatmaps, Surfaces, Contours)
      if (Array.isArray(trace.z) && trace.z.length > 0) {
        return trace.z.some((row: any) => Array.isArray(row) ? row.length > 0 : row !== null)
      }

      // 3. Special nested trace types
      // Parallel Coordinates & Dimensions
      if (Array.isArray(trace.dimensions) && trace.dimensions.length > 0) {
        return trace.dimensions.some((dim: any) => Array.isArray(dim?.values) && dim.values.length > 0)
      }

      // Table traces
      if (trace.cells && Array.isArray(trace.cells.values) && trace.cells.values.length > 0) {
        return trace.cells.values.some((col: any) => Array.isArray(col) && col.length > 0)
      }

      // Sankey diagrams
      if (trace.link && Array.isArray(trace.link.source) && trace.link.source.length > 0) {
        return true
      }

      // 4. Standard 1D data arrays (Scatter, Bar, Pie, Sunburst, Maps, Box, Violin, etc.)
      const arrayKeys = ['x', 'y', 'values', 'labels', 'locations', 'lat', 'lon', 'parents', 'ids', 'r', 'theta']

      return arrayKeys.some((key: string) => {
        return Array.isArray(trace[key]) && trace[key].length > 0
      })
    })
  }

  function handlePlot (el: string | HTMLElement, data: any[], layout: any, config?: any) {
    hasData.value = isEmpty(data)

    return new Promise<Plotly.PlotlyHTMLElement | undefined>(resolve => {
      try {
        Plotly.purge(el)
      } catch {
        // Do nothing here
      }

      nextTick(() => {
        if (hasData.value) {
          resolve(Plotly.react(el, data, layout, config))
        } else {
          resolve(undefined)
        }
      })
    })
  }

  // 2. Pass your implementation to defineExpose
  const exposedMethods: BaseChartExposed = {
    register: (modules: any | any[]): void => {
      Plotly.register(modules)
    },
    purge: (el: string | HTMLElement): void => {
      Plotly.purge(el)
    },
    react: (el: string | HTMLElement, data: any, layout?: any, config?: any): Promise<Plotly.PlotlyHTMLElement | undefined> => {
      return handlePlot(el, data, layout, config)
    },
    restyle: (el: string | HTMLElement, update: any, indices?: number[]): Promise<Plotly.PlotlyHTMLElement | undefined> => {
      return Plotly.restyle(el, update, indices)
    },
    relayout: (el: string | HTMLElement, update: any): Promise<Plotly.PlotlyHTMLElement | undefined> => {
      return Plotly.relayout(el, update)
    },
    downloadImage: (el: string | HTMLElement, opts?: any): Promise<string> => {
      return Plotly.downloadImage(el, opts)
    },
  }

  defineExpose(exposedMethods)
</script>
