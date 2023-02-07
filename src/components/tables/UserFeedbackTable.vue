<template>
  <div>
    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      effect="fade"
      @close="coolboxIndex = null" />
    <BaseTable :options="options"
               :columns="columns"
               primary-key="id"
               v-bind="$props"
               ref="userFeedbackTable"
               v-on="$listeners">
      <template v-slot:cell(severity)="data">
        <b-badge class="w-100" ><MdiIcon :path="userFeedbackSeverityTypes[data.item.severity].path" :className="userFeedbackSeverityTypes[data.item.severity].color"/> {{ userFeedbackSeverityTypes[data.item.severity].text() }}</b-badge>
      </template>

      <template v-slot:cell(feedbackType)="data">
        <b-badge class="w-100"><MdiIcon :path="userFeedbackTypeMap[data.item.feedbackType].path" :color="userFeedbackTypeMap[data.item.feedbackType].color()"/> {{ userFeedbackTypeMap[data.item.feedbackType].text() }}</b-badge>
      </template>

      <template v-slot:cell(pageUrl)="data">
        <span class="text-nowrap"><a target="_blank" rel="noopener noreferrer" :title="data.item.pageUrl" :href="data.item.pageUrl" v-if="data.item.pageUrl">{{ truncateAfterChars(data.item.pageUrl, 30) }}</a> <MdiIcon :path="mdiOpenInNew" /></span>
      </template>

      <template v-slot:cell(contactEmail)="data">
        <a :href="`mailto:${data.item.contactEmail}`" v-if="data.item.contactEmail">{{ data.item.contactEmail }}</a>
      </template>

      <template v-slot:cell(content)="data">
        <span :title="data.item.content" v-if="data.item.content">{{ truncateAfterWords(data.item.content, 10) }}</span>
        <a href="#" class="table-icon-link" @click.prevent="showFullContent(data.item.content)" v-b-tooltip="$t('buttonReadMore')" v-if="isTruncatedAfterWords(data.item.content, 10)" >&nbsp;
          <MdiIcon :path="mdiPageNext" />
        </a>
      </template>

      <!-- Image -->
      <template v-slot:cell(image)="data">
        <a :href="getSrc(data.item, 'large')" @click.prevent="update(data.item)">
          <b-img-lazy :src="getSrc(data.item, 'small')" class="table-image" alt="Image" />
        </a>
      </template>

      <template v-slot:cell(isNew)="data">
        <b-button class="text-nowrap" @click="markAsRead(data.item)" v-if="data.item.isNew"><MdiIcon :path="mdiNewBox"/> {{ $t('buttonMarkAsRead') }}</b-button>
        <b-button disabled v-else><MdiIcon :path="mdiEyeCheckOutline"/> {{ $t('buttonHasBeenRead') }}</b-button>
      </template>

      <template v-slot:cell(actions)="data">
        <b-button @click="onFeedbackDeleteClicked(data.item)"><MdiIcon className="text-danger" :path="mdiDelete"/> {{ $t('buttonDelete') }}</b-button>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import { mapGetters } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props'
import MdiIcon from '@/components/icons/MdiIcon'
import { getHighContrastTextColor } from '@/mixins/colors'
import { getFeedbackImageUrl } from '@/mixins/image'
import { isTruncatedAfterWords, truncateAfterWords, truncateAfterChars } from '@/mixins/formatting'
import { mdiPageNext, mdiNewBox, mdiEyeCheckOutline, mdiOpenInNew, mdiDelete } from '@mdi/js'
import { apiDeleteUserFeedback, apiGetUserFeedbackMarkAsRead } from '@/mixins/api/misc'

import { userFeedbackTypes, userFeedbackSeverityTypes } from '@/mixins/types'

export default {
  name: 'UserFeedbackTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    return {
      mdiPageNext,
      mdiNewBox,
      mdiEyeCheckOutline,
      mdiOpenInNew,
      mdiDelete,
      userFeedbackSeverityTypes,
      options: {
        idColumn: 'id',
        tableName: 'userfeedback',
        orderBy: 'updatedOn',
        orderByDesc: true
      },
      coolboxIndex: null,
      coolboxImages: []
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    userFeedbackTypeMap: function () {
      const result = {}

      userFeedbackTypes.forEach(t => {
        result[t.id] = t
      })

      return result
    },
    columns: function () {
      return [{
        key: 'id',
        type: Number,
        class: 'text-right',
        sortable: true,
        label: this.$t('tableColumnUserFeedbackId')
      }, {
        key: 'feedbackType',
        type: String,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackType')
      }, {
        key: 'severity',
        type: String,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackSeverity')
      }, {
        key: 'content',
        type: String,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackContent')
      }, {
        key: 'pageUrl',
        type: String,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackPageUrl')
      }, {
        key: 'contactEmail',
        type: String,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackContactEmail')
      }, {
        key: 'updatedOn',
        type: Date,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackUpdatedOn'),
        formatter: value => value ? new Date(value).toLocaleString() : null,
        preferredSortingColumn: true
      }, {
        key: 'image',
        type: undefined,
        sortable: false,
        label: this.$t('tableColumnUserFeedbackImage')
      }, {
        key: 'isNew',
        type: Boolean,
        sortable: true,
        label: this.$t('tableColumnUserFeedbackMarkRead')
      }, {
        key: 'actions',
        type: undefined,
        sortable: false,
        label: ''
      }]
    }
  },
  components: {
    BaseTable,
    CoolLightBox,
    MdiIcon
  },
  methods: {
    getHighContrastTextColor,
    isTruncatedAfterWords,
    truncateAfterWords,
    truncateAfterChars,
    onFeedbackDeleteClicked: function (feedback) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okTitle: this.$t('buttonDelete'),
        okVariant: 'danger',
        cancelTitle: this.$t('buttonCancel')
      })
        .then(value => {
          if (value === true) {
            apiDeleteUserFeedback(feedback.id, () => this.refresh())
          }
        })
    },
    showFullContent: function (description) {
      this.$bvModal.msgBoxOk(description, {
        title: this.$t('tableColumnUserFeedbackContent'),
        okTitle: this.$t('genericOk')
      })
    },
    markAsRead: function (item) {
      apiGetUserFeedbackMarkAsRead(item.id, () => this.refresh())
    },
    refresh: function () {
      this.$refs.userFeedbackTable.refresh()
    },
    getSrc: function (image, size) {
      return getFeedbackImageUrl(image.id, {
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    update: function (i) {
      this.coolboxImages = [{
        src: this.getSrc(i, 'large')
      }]
      this.coolboxIndex = 0
    }
  }
}
</script>

<style scoped>
.table-image {
  min-width: 200px;
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}
</style>
