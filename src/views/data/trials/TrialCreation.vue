<template>
  <div>
    <h1>{{ $t('pageTrialCreationTitle') }}</h1>
    <hr />
    <p v-html="$t('pageTrialCreationText')" />

    <b-row class="mb-3">
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/germplasm-selection.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationGermplasmListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationGermplasmListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 0 ? 'primary' : 'secondary'" @click="tabIndex = 0">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/layout-design.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationFieldhubListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationFieldhubListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 1 ? 'primary' : 'secondary'" @click="tabIndex = 1">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
      <b-col cols=12 md=6 lg=4>
        <b-card no-body class="trial-creation-card h-100">
          <b-card-body>
            <b-img :src="require('@/assets/img/data-collection.svg')" class="p-3 card-img" />
            <b-card-title>{{ $t('pageTrialCreationGridScoreListCardTitle') }}</b-card-title>
            <b-card-text>{{ $t('pageTrialCreationGridScoreListCardText') }}</b-card-text>
          </b-card-body>
          <b-button :variant="tabIndex === 2 ? 'primary' : 'secondary'" @click="tabIndex = 2">{{ $t('buttonSelect') }}</b-button>
        </b-card>
      </b-col>
    </b-row>

    <div v-show="tabIndex === 0">
      <h3>{{ $t('pageTrialCreationGermplasmTitle') }}</h3>
      <p v-html="$t('pageTrialCreationGermplasmText')" />

      <GermplasmTableComponent :download="onDownload" />
    </div>
    <div v-show="tabIndex === 1">
      <h3>{{ $t('pageTrialCreationFieldHubTitle') }}</h3>
      <p v-html="$t('pageTrialCreationFieldHubText')" />

      <b-button @click="$refs.datasetEditModal.show()">{{ $t('buttonCreateDataset') }}</b-button>

      <DatasetEditModal @changed="onDatasetCreated" ref="datasetEditModal" />
    </div>
  </div>
</template>

<script>
import GermplasmTableComponent from '@/components/germplasm/GermplasmTableComponent'
import DatasetEditModal from '@/components/modals/DatasetEditModal'
import { apiPostTableExport } from '@/mixins/api/misc'

export default {
  components: {
    DatasetEditModal,
    GermplasmTableComponent
  },
  data: function () {
    return {
      tabIndex: null
    }
  },
  methods: {
    onDatasetCreated: function (datasetId) {
      console.log(datasetId)
    },
    onDownload: function (data, callback) {
      return apiPostTableExport({
        columnNameMapping: { germplasmName: 'TREATMENT' },
        filter: [{
          column: 'germplasmId',
          comparator: 'inSet',
          operator: 'and',
          values: this.$store.getters.storeMarkedGermplasm
        }]
      }, 'germplasm', callback)
    }
  },
  beforeRouteLeave: function (to, from, next) {
    // Ask for confirmation
    this.$bvModal.msgBoxConfirm(this.$t('modalTextLeaveTrialCreation'), {
      title: this.$t('modalTitleLeaveTrialCreation'),
      okTitle: this.$t('genericYes'),
      okVariant: 'danger',
      cancelTitle: this.$t('genericNo')
    }).then(value => {
      if (value) {
        next()
      }
    })
  }
}
</script>

<style scoped>
.trial-creation-card .card-img {
  width: 100%;
  height: 200px;
  object-fit: contain;
}
</style>
