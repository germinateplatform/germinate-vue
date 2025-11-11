<template>
  <div v-if="datasets && datasets.length > 0">
    <div v-if="hasPlotData">
      <BaseChart
        :title="$t('pagePedigreeChartTitle')"
        :chart-id="id"
        chart-type="d3.js"
        :filename="filename"
        :source-file="sourceFile"
        header-icon="mdi-family-tree"
        :header-icon-color="headerIconColor"
        :supports-svg-download="false"
        :supports-file-download="false"
        :toolbar-color="''"
        @force-redraw="redraw"
        @download-png-manually="downloadImage"
      >
        <template #chart-content>
          <h4>{{ $t('pagePassportPedigreeChartTitle') }}</h4>
          <v-select :items="datasets" item-value="datasetId" item-title="datasetName" v-model="selectedDataset" :label="$t('formLabelPedigreeChartDatasetSelect')" />

          <div :id="id" ref="graph" class="pedigree-chart" v-if="hasPlotData" />
        </template>

        <template #card-actions v-if="hasPlotData">
          <div class="d-flex flex-column align-start">
            <v-btn prepend-icon="$helium" variant="tonal" :text="$t('buttonDownloadForHelium')" />
            <p><span class="text-muted" v-html="$t('pageExportFormatsHeliumText')" />&nbsp;<router-link :to="Pages.aboutExportFormats.path" v-tooltip:top="$t('tooltipExportFormatLearnMore')"> <v-icon icon="mdi-information-outline" /></router-link> </p>
          </div>
        </template>
      </BaseChart>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { downloadBlob, uuidv4, type DownloadBlob } from '@/plugins/util'

  import { DataSet, Network } from 'vis-network/standalone'

  import { coreStore } from '@/stores/app'
  import { getColor, getHighContrastTextColor } from '@/plugins/util/colors'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTablePedigrees, type PaginatedRequest, type ViewTableDatasets, type ViewTableGermplasm } from '@/plugins/types/germinate'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmDatasetTable, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { Pages } from '@/plugins/pages'
  import { getDateTimeString } from '@/plugins/util/formatting'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    germplasm: ViewTableGermplasm
    headerIconColor?: string
  }>()

  const store = coreStore()
  const router = useRouter()

  const hasPlotData = ref(false)
  const datasets = ref<ViewTableDatasets[]>([])
  const selectedDataset = ref<number>()
  const sourceFile = ref<DownloadBlob>()
  const id = ref('pedigree-' + uuidv4())

  let plotData: ViewTablePedigrees[] = []
  let network: any
  let canvasData: any

  interface Node {
    id: number
    name: string
    number: string
  }
  interface Connection {
    from: number
    to: number
    arrows: string
    color: string
  }

  const filename = computed(() => {
    if (compProps.germplasm) {
      return `pedigree-${compProps.germplasm.germplasmId}-dataset-${selectedDataset.value || 'null'}`
    } else {
      return ''
    }
  })

  async function redraw () {
    nextTick(() => {
      const element = document.querySelector(`#${id.value}`)

      if (!element) {
        return
      }

      while (element?.firstChild) {
        element.firstChild.remove()
      }

      if (plotData) {
        const nodes: { [key: string]: Node } = {}
        const connections: Connection[] = []

        plotData.forEach(r => {
          nodes[r.childId] = {
            id: r.childId,
            name: r.childName,
            number: r.childNumber,
          }
          nodes[r.parentId] = {
            id: r.parentId,
            name: r.parentName,
            number: r.parentNumber,
          }
        })

        plotData.forEach(r => {
          let edgeColor = '#999999'
          if (r.relationshipType === 'F') {
            edgeColor = '#e74c3c'
          } else if (r.relationshipType === 'M') {
            edgeColor = '#2980b9'
          }

          connections.push({
            from: r.parentId,
            to: r.childId,
            arrows: 'to',
            color: edgeColor,
          })
        })

        const data: any[] = []
        const bgColor = getColor(0)
        const fgColor = getHighContrastTextColor(bgColor)
        const dark = store.storeIsDarkMode
        Object.keys(nodes).forEach(n => {
          const node = nodes[n]
          const bg = node.name === compProps.germplasm.germplasmName ? bgColor : (dark ? '#000000' : '#ffffff')
          const fg = node.name === compProps.germplasm.germplasmName ? fgColor : (dark ? '#ffffff' : '#000000')
          const border = dark ? '#ffffff' : '#000000'
          let label = node.name
          if (node.number) {
            label += '\n' + node.number
          }
          data.push({
            id: node.id,
            label: label,
            shape: 'circle',
            font: { color: fg },
            color: {
              background: bg,
              border: border,
              highlight: { background: bg, border: border },
              hover: { background: bg, border: border },
            },
          })
        })

        const nodeDs = new DataSet(data)
        const edgeDs = new DataSet(connections)

        network = new Network(element, { nodes: nodeDs, edges: edgeDs }, {
          interaction: { hover: true, zoomView: false },
          manipulation: { enabled: false },
          layout: {
            hierarchical: {
              direction: 'UD',
              sortMethod: 'directed',
            },
          },
          edges: { smooth: true },
        })

        const networkCanvas = element?.getElementsByTagName('canvas')[0]

        network.on('click', (params: any) => {
          const id = network.getNodeAt(params.pointer.DOM)

          if (id !== undefined && id !== null && id !== compProps.germplasm.germplasmId) {
            navigateToPassportPage(id)
          }
        })
        network.on('hoverNode', (params: any) => {
          const id = network.getNodeAt(params.pointer.DOM)
          if (id === compProps.germplasm.germplasmId) {
            // NOTHING
          } else {
            if (networkCanvas) {
              networkCanvas.style.cursor = 'pointer'
            }
          }
        })
        network.on('blurNode', () => {
          if (networkCanvas) {
            networkCanvas.style.cursor = 'default'
          }
        })
        network.on('afterDrawing', afterDrawing)
      }
    })
  }

  function afterDrawing (ctx: CanvasRenderingContext2D) {
    // Save the context canvas data so we can download it if required
    const dataUrl = ctx.canvas.toDataURL()
    canvasData = dataUrl
    network.off('afterDrawing', afterDrawing)
  }

  function navigateToPassportPage (germplasmId: number) {
    router.push(Pages.getPath(Pages.passport, `${germplasmId}`))
  }

  function getPlotData () {
    const query: PaginatedRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'parentName',
          comparator: FilterComparator.equals,
          values: [compProps.germplasm.germplasmName],
        }, {
          column: 'childName',
          comparator: FilterComparator.equals,
          values: [compProps.germplasm.germplasmName],
        }],
        operator: FilterOperator.or,
      }],
    }

    apiPostPedigreeTable<PaginatedResult<ViewTablePedigrees[]>>(query, result => {
      if (result && result.data && result.data.length > 0) {
        plotData = result.data
        hasPlotData.value = true

        redraw()
      }
    })
  }

  function init () {
    if (compProps.germplasm) {
      apiPostGermplasmDatasetTable<PaginatedResult<ViewTableDatasets[]>>(compProps.germplasm.germplasmId, {
        filters: [{
          filters: [{
            column: 'datasetType',
            comparator: FilterComparator.equals,
            values: ['pedigree'],
          }],
          operator: FilterOperator.and,
        }],
        page: 1,
        limit: MAX_JAVA_INTEGER,
      }, result => {
        if (result && result.data) {
          datasets.value = result.data

          if (result.data.length > 0) {
            selectedDataset.value = result.data.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0].datasetId
          } else {
            selectedDataset.value = undefined
          }
        }
      })
    }
  }

  function downloadImage () {
    fetch(canvasData)
      .then(async res => {
        downloadBlob({
          blob: await res.blob(),
          filename: `pedigree-${compProps.germplasm.germplasmId}-ds-${selectedDataset.value}-${getDateTimeString()}`,
          extension: 'png',
        })
      })
  }

  watch(selectedDataset, async () => getPlotData())

  onMounted(() => init())

  onBeforeMount(() => emitter.on('license-accepted', init))
  onBeforeUnmount(() => emitter.off('license-accepted', init))

  defineExpose({
    redraw,
  })
</script>

<style>
.pedigree-chart {
  height: 500px;
}
</style>
