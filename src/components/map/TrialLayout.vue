<template>
  <div v-if="dataset">
    <h2>{{ dataset.datasetName }}</h2>

    <LayoutHighlightSelection
      :dataset-id="dataset.datasetId || -1"
      :traits="numericOrCategoricalTraits"
      ref="highlightSelection"
      v-model:taxonomies="taxonomies"
    />

    <v-btn @click="updateHighlight" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />

    <div class="field-plan-wrapper" ref="wrapperRef">
      <canvas
        ref="canvasRef"
        class="field-plan-canvas"
        @wheel.prevent="onWheel"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onTouchEnd"
      />
      <div class="field-plan-controls">
        <v-btn @click="zoomIn" :icon="mdiPlus" />
        <v-btn @click="resetView" title="Reset view" :icon="mdiRecordCircleOutline" />
        <v-btn @click="zoomOut" :icon="mdiMinus" />
      </div>
      <div class="field-plan-legend" v-if="legend && legend.length > 0">
        <template
          v-for="item in legend"
          :key="`legend-item-${item.color}`"
        >
          <span class="legend-dot" :style="{ background: item.color }" /> {{ item.name }}
        </template>
      </div>

      <!-- Tooltip -->
      <Teleport to="body">
        <div
          v-if="tooltipVisible && hoveredPlot"
          class="field-plan-tooltip text-wrap"
          :style="{ left: `${tooltipX + 14}px`, top: `${tooltipY - 8}px` }"
        >
          <slot name="tooltip" v-bind="hoveredPlot">
            <!-- Fake up an array of just a single entry to basically have a temporary variable -->
            <template
              :key="`${cell.row + 1}|${cell.column + 1}`"
              v-for="cell in [cellMapping[`${hoveredPlot.row + 1}|${hoveredPlot.col + 1}`]]"
            >
              <v-list-item
                v-if="cell"
                :title="cell.germplasmDisplayName"
                :subtitle="cell.traitValue || 'N/A'"
              >
                <template #subtitle="{ subtitle }">
                  <p>{{ cell.germplasmName }}</p>
                  <v-chip label variant="flat" :color="cell.color" :text="subtitle" />
                </template>
              </v-list-item>
              <span v-else>N/A</span>
            </template>
          </slot>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { apiPostTraitDatasetStats, apiPostTrialLayouts, apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type Taxonomies, type TraitStats, type TrialsExportDatasetRequest, type ViewTableDatasets, type ViewTableTraits, type ViewTableTrialLayouts, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/LayoutHighlightSelection.vue'
  import { mdiMinus, mdiPlus, mdiRecordCircleOutline, mdiRefresh } from '@mdi/js'
  import emitter from 'tiny-emitter/instance'
  import { brighten, createMultiColorGradient, getColor, getGradientColor, getPrimaryColor, GRADIENT_VIRIDIS, hexToRgb, rgbColorToHex } from '@/plugins/util/colors'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { AsyncCache } from '@/plugins/util/AsyncCache'

  // ─── Types ────────────────────────────────────────────────────────────────────
  export interface PlotCoord {
    row: number
    col: number
  }

  export interface PlotStyle {
    gap: number
    radius: number
    fillColor: string
    strokeColor: string
    highlightFill: string
    highlightStroke: string
    labelColor: string
    labelFont: string
    rowLabelColor: string
    rowLabelFont: string
  }

  interface FieldPlanCell extends ViewTableTrialLayouts {
    traitValue?: string
    color?: string
  }

  // ─── Props ────────────────────────────────────────────────────────────────────

  const props = withDefaults(
    defineProps<{
      dataset: ViewTableDatasets
      traits: ViewTableTraits[]
      /** Visual options — override any of these to customise the look */
      plotStyle?: Partial<PlotStyle>
    }>(),
    {
      plotStyle: () => ({}),
    },
  )

  const rows = shallowRef(1)
  const columns = shallowRef(1)

  const numericOrCategoricalTraits = computed(() => props.traits.filter(t => t.scaleDatatype === 'numeric' || t.scaleDatatype === 'categorical'))

  const cellMapping = shallowRef<{ [index: string]: FieldPlanCell }>({})

  // ─── Resolved style (props merged with defaults) ──────────────────────────────

  const DEFAULT_STYLE: PlotStyle = {
    gap: 4,
    radius: 3,
    fillColor: getPrimaryColor(),
    strokeColor: rgbColorToHex(brighten(hexToRgb(getPrimaryColor()) || { r: 128, g: 128, b: 128 })),
    highlightFill: '#f4a261',
    highlightStroke: '#e76f51',
    labelColor: '#ffffff',
    labelFont: '11px monospace',
    rowLabelColor: '#64748b',
    rowLabelFont: '12px sans-serif',
  }

  function resolvedStyle (): PlotStyle {
    return { ...DEFAULT_STYLE, ...props.plotStyle }
  }

  // ─── Template refs ────────────────────────────────────────────────────────────

  const wrapperRef = ref<HTMLDivElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  // Tooltip
  const hoveredPlot = ref<PlotCoord | null>(null)
  const tooltipX = ref(0)
  const tooltipY = ref(0)
  const tooltipVisible = ref(false)

  // ─── Viewport state ───────────────────────────────────────────────────────────

  const highlightedPlots = ref<Map<string, string>>(new Map())
  const legend = ref<{ name: string, color: string }[]>([])
  const taxonomies = ref<Taxonomies[]>()

  const cachedTraitStats: AsyncCache<TraitStats[], number[]> = new AsyncCache<TraitStats[], number[]>((traitIds: number[]) => {
    return new Promise<TraitStats[]>(resolve => {
      apiPostTraitDatasetStats({
        datasetIds: [props.dataset.datasetId || -1],
        traitIds: traitIds,
      }, result => {
        resolve(result)
      })
    })
  }, { serializeKey: (coords: number[]) => coords.join('|') })

  const cachedTraitData: AsyncCache<ViewTableTrialsData[], string[]> = new AsyncCache<ViewTableTrialsData[], string[]>((traitIds: string[]) => {
    return new Promise<ViewTableTrialsData[]>(resolve => {
      const request: TrialsExportDatasetRequest = {
        datasetIds: [props.dataset.datasetId || -1],
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filters: [{
          filters: [{
            column: 'variableId',
            comparator: FilterComparator.equals,
            values: traitIds,
          }, {
            column: 'trialRow',
            comparator: FilterComparator.isNotNull,
            values: [],
          }, {
            column: 'trialColumn',
            comparator: FilterComparator.isNotNull,
            values: [],
          }],
          operator: FilterOperator.and,
        }],
      }
      apiPostTrialsDataTable(request, result => {
        resolve(result.data)
      })
    })
  }, { serializeKey: (coords: string[]) => coords.join('|') })

  let scale = 1
  let offsetX = 0
  let offsetY = 0

  // Pan state
  let isPanning = false
  let lastMouseX = 0
  let lastMouseY = 0

  // Touch-pinch state
  let lastTouchDist: number | null = null

  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  // ─── Public API ───────────────────────────────────────────────────────────────

  async function updateHighlight () {
    emitter.emit('set-loading', true)

    const hl: Map<string, string> = new Map()
    legend.value = []

    const us = userSelection.value
    let options: string[] = []
    if (us) {
      options = us.selectedItems

      if (us.type === 'trait') {
        Object.values(cellMapping.value).forEach(c => {
          c.color = undefined
          c.traitValue = undefined
          hl.set(`${c.row - 1}|${c.column - 1}`, '#aaaaaa')
        })

        const traitStats = await cachedTraitStats.get(us.selectedItems.map(Number))
        if (!traitStats || traitStats.length === 0) {
          return
        }

        const traitData = await cachedTraitData.get(us.selectedItems)

        const gradient = createMultiColorGradient(GRADIENT_VIRIDIS, 100)
        const valueSet: { [index: string]: number } = {}
        let count = 0

        traitData.forEach(td => {
          let color: string

          if (traitStats[0].dataType === 'numeric') {
            color = getGradientColor(gradient, traitStats[0].min, traitStats[0].max, +td.traitValue)
          } else {
            const index = valueSet[td.traitValue]

            if (index === undefined) {
              valueSet[td.traitValue] = count
              color = getColor(count + 1)
              count++
            } else {
              color = getColor(index + 1)
            }
          }

          cellMapping.value[`${td.trialRow}|${td.trialColumn}`].traitValue = td.traitValue
          cellMapping.value[`${td.trialRow}|${td.trialColumn}`].color = color
          hl.set(`${td.trialRow - 1}|${td.trialColumn - 1}`, color)
        })

        if (traitStats[0].dataType === 'numeric') {
          // Set the legend directly based on range
          legend.value = [
            { name: `${traitStats[0].min}`, color: getGradientColor(gradient, traitStats[0].min, traitStats[0].max, traitStats[0].min) },
            { name: `${traitStats[0].max}`, color: getGradientColor(gradient, traitStats[0].min, traitStats[0].max, traitStats[0].max) },
          ]
        } else {
          options = Object.keys(valueSet)
        }
      } else {
        Object.values(cellMapping.value).forEach(c => {
          c.traitValue = undefined
          c.color = undefined
          let index = -1
          switch (us.type) {
            case 'reps':
              index = options.indexOf(c.rep || '')
              break
            case 'treatments':
              index = options.indexOf(c.treatment || '')
              break
            case 'taxonomies':
              index = options.indexOf(`${c.taxonomyId || ''}`)
              break
            case 'germplasm':
              index = options.indexOf(c.germplasmDisplayName)
              break
          }

          if (index !== -1) {
            hl.set(`${c.row - 1}|${c.column - 1}`, getColor(index + 1))
          }
        })
      }

      if (us.type === 'taxonomies' && taxonomies.value) {
        options = options.map((o, i) => [taxonomies.value?.[i]?.genus, taxonomies.value?.[i]?.species, taxonomies.value?.[i]?.subtaxa].filter(p => p !== undefined && p !== '').join(' '))
      }
    }

    if (!legend.value || legend.value.length === 0) {
      legend.value = options.map((o, i) => {
        return {
          name: o,
          color: getColor(i + 1),
        }
      })
    }
    highlightedPlots.value = hl

    draw()

    emitter.emit('set-loading', false)
  }

  /** Clear all highlighted plots. */
  function clearHighlights (): void {
    highlightedPlots.value = new Map()
    draw()
  }

  // ─── Zoom helpers ─────────────────────────────────────────────────────────────

  function canvasLogicalSize (): { cw: number, ch: number } {
    const canvas = canvasRef.value
    if (!canvas) return { cw: 0, ch: 0 }
    const dpr = window.devicePixelRatio || 1
    return { cw: canvas.width / dpr, ch: canvas.height / dpr }
  }

  function zoomIn (): void {
    const { cw, ch } = canvasLogicalSize()
    applyZoom(1.25, cw / 2, ch / 2)
  }

  function zoomOut (): void {
    const { cw, ch } = canvasLogicalSize()
    applyZoom(0.8, cw / 2, ch / 2)
  }

  function resetView (): void {
    scale = 1
    offsetX = 0
    offsetY = 0
    fitToCanvas()
    draw()
  }

  function applyZoom (factor: number, cx: number, cy: number): void {
    const newScale = Math.min(Math.max(scale * factor, 0.25), 8)
    const ratio = newScale / scale
    offsetX = cx - ratio * (cx - offsetX)
    offsetY = cy - ratio * (cy - offsetY)
    scale = newScale
    draw()
  }

  // ─── Event handlers ───────────────────────────────────────────────────────────

  function onWheel (e: WheelEvent): void {
    const canvas = canvasRef.value
    if (!canvas) {
      return
    }
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    applyZoom(factor, cx, cy)
  }

  function onMouseDown (e: MouseEvent): void {
    isPanning = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  }

  function onMouseMove (e: MouseEvent): void {
    if (isPanning) {
      offsetX += e.clientX - lastMouseX
      offsetY += e.clientY - lastMouseY
      lastMouseX = e.clientX
      lastMouseY = e.clientY
      draw()
      return
    }

    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const plot = plotAtPoint(mx, my)
    if (plot) {
      hoveredPlot.value = plot
      tooltipX.value = e.clientX
      tooltipY.value = e.clientY
      tooltipVisible.value = true
    } else {
      tooltipVisible.value = false
      hoveredPlot.value = null
    }
  }

  /** Returns the plot at canvas CSS-pixel coordinates, or null if none. */
  function plotAtPoint (mx: number, my: number): PlotCoord | null {
    const canvas = canvasRef.value
    if (!canvas) {
      return null
    }
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const s = resolvedStyle()
    const pw = basePlotW(cw, ch)
    const ph = basePlotH(cw, ch)

    // Transform mouse point into grid space
    const gx = (mx - offsetX) / scale
    const gy = (my - offsetY) / scale

    const col = Math.floor(gx / (pw + s.gap))
    const row = Math.floor(gy / (ph + s.gap))

    if (col < 0 || col >= columns.value || row < 0 || row >= rows.value) {
      return null
    }

    // Make sure we're not in the gap between plots
    const localX = gx - col * (pw + s.gap)
    const localY = gy - row * (ph + s.gap)
    if (localX > pw || localY > ph) return null

    return { row, col }
  }

  function onMouseLeave (): void {
    isPanning = false
    tooltipVisible.value = false
    hoveredPlot.value = null
  }

  function onMouseUp (): void {
    isPanning = false
  }

  function onTouchStart (e: TouchEvent): void {
    if (e.touches.length === 1) {
      isPanning = true
      lastMouseX = e.touches[0].clientX
      lastMouseY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      isPanning = false
      lastTouchDist = touchDist(e.touches)
    }
  }

  function onTouchMove (e: TouchEvent): void {
    if (e.touches.length === 1 && isPanning) {
      offsetX += e.touches[0].clientX - lastMouseX
      offsetY += e.touches[0].clientY - lastMouseY
      lastMouseX = e.touches[0].clientX
      lastMouseY = e.touches[0].clientY
      draw()
    } else if (e.touches.length === 2 && lastTouchDist !== null) {
      const canvas = canvasRef.value
      if (!canvas) return
      const dist = touchDist(e.touches)
      const factor = dist / lastTouchDist
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const rect = canvas.getBoundingClientRect()
      applyZoom(factor, midX - rect.left, midY - rect.top)
      lastTouchDist = dist
    }
  }

  function onTouchEnd (): void {
    isPanning = false
    lastTouchDist = null
  }

  function touchDist (touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // ─── Layout & drawing ─────────────────────────────────────────────────────────

  function onResize (): void {
    const canvas = canvasRef.value
    const wrapper = wrapperRef.value
    if (!canvas || !wrapper) return

    const dpr = window.devicePixelRatio || 1
    const w = wrapper.clientWidth
    const h = wrapper.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    // Re-apply DPR scale after resizing (resizing resets the context transform)
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)

    fitToCanvas()
    draw()
  }

  /** Scale + centre the grid so it fills the canvas on load / reset. */
  function fitToCanvas (): void {
    const canvas = canvasRef.value
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const s = resolvedStyle()
    const pad = 40

    const gridW = columns.value * (basePlotW(cw, ch) + s.gap) - s.gap
    const gridH = rows.value * (basePlotH(cw, ch) + s.gap) - s.gap
    const scaleX = (cw - pad * 2) / gridW
    const scaleY = (ch - pad * 2) / gridH

    scale = Math.min(scaleX, scaleY, 1) // never > 1 on first fit
    offsetX = (cw - gridW * scale) / 2
    offsetY = (ch - gridH * scale) / 2
  }

  /** Base plot width before the viewport scale is applied. */
  function basePlotW (cw: number, _ch: number): number {
    return Math.max(24, Math.floor((cw * 0.8) / columns.value))
  }

  /** Base plot height before the viewport scale is applied. */
  function basePlotH (_cw: number, ch: number): number {
    return Math.max(24, Math.floor((ch * 0.8) / rows.value))
  }

  function draw (): void {
    const canvas = canvasRef.value
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const cw = canvas.width / dpr
    const ch = canvas.height / dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const s = resolvedStyle()

    ctx.save()
    ctx.clearRect(0, 0, cw, ch)

    // Background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(0, 0, cw, ch)

    // Apply viewport transform
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    const pw = basePlotW(cw, ch)
    const ph = basePlotH(cw, ch)

    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < columns.value; c++) {
        const x = c * (pw + s.gap)
        const y = r * (ph + s.gap)
        const highlightColor = highlightedPlots.value.get(`${r}|${c}`)

        const cell = cellMapping.value[`${r + 1}|${c + 1}`]

        if (!cell) {
          continue
        }

        // Plot rectangle
        ctx.beginPath()
        drawRoundRect(ctx, x, y, pw, ph, s.radius)
        ctx.fillStyle = highlightColor || s.fillColor
        ctx.strokeStyle = highlightColor || s.strokeColor
        ctx.lineWidth = highlightColor ? 2 : 1
        ctx.fill()
        ctx.stroke()

        // Plot label (row letter + col number, e.g. "A3")
        if (pw >= 20 && ph >= 16) {
          const label = `${String.fromCodePoint(65 + r)}${c + 1}`
          ctx.font = s.labelFont
          ctx.fillStyle = s.labelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.globalAlpha = highlightColor ? 1 : 0.75
          ctx.fillText(label, x + pw / 2, y + ph / 2)
          ctx.globalAlpha = 1
        }
      }
    }

    // Row axis labels (A, B, C …) to the left of the grid
    ctx.font = s.rowLabelFont
    ctx.fillStyle = s.rowLabelColor
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let r = 0; r < rows.value; r++) {
      const y = r * (ph + s.gap) + ph / 2
      ctx.fillText(String.fromCodePoint(65 + r), -s.gap - 2, y)
    }

    // Column axis labels (1, 2, 3 …) above the grid
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    for (let c = 0; c < columns.value; c++) {
      const x = c * (pw + s.gap) + pw / 2
      ctx.fillText(String(c + 1), x, -s.gap - 2)
    }

    ctx.restore()
  }

  /** Polyfill for ctx.roundRect (Safari < 15.4 / older Chrome). */
  function drawRoundRect (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number,
  ): void {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r)
      return
    }
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    const query = {
      datasetIds: [props.dataset.datasetId || -1],
    }

    emitter.emit('show-loading', true)

    apiPostTrialLayouts(query, result => {
      if (result) {
        let maxRow = 0
        let maxCol = 0

        const mapping: { [index: string]: ViewTableTrialLayouts } = {}

        result.forEach(r => {
          maxRow = Math.max(maxRow, r.row)
          maxCol = Math.max(maxCol, r.column)
          mapping[`${r.row}|${r.column}`] = r
        })

        rows.value = maxRow
        columns.value = maxCol
        cellMapping.value = mapping

        resizeObserver = new ResizeObserver(() => onResize())
        if (wrapperRef.value) {
          resizeObserver.observe(wrapperRef.value)
        }
        onResize()
      }
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
  })
</script>

<style scoped>
.field-plan-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}

.field-plan-canvas {
  display: block;
  cursor: grab;
  touch-action: none;
}
.field-plan-canvas:active { cursor: grabbing; }

/* Zoom controls */
.field-plan-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-plan-controls button {
  width: 32px;
  height: 32px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background 0.15s;
}
.field-plan-controls button:hover { background: #f1f5f9; }

/* Legend */
.field-plan-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font: 12px sans-serif;
  color: #64748b;
  background: rgba(255, 255, 255, 0.85);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 2px;
}

.field-plan-tooltip {
  position: fixed;
  z-index: 1000;
  background: #1e293b;
  color: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  font: 13px sans-serif;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  max-width: 240px;
  white-space: normal;
}
</style>
