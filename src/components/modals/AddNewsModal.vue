<template>
  <b-modal
    ref="addNewsModal"
    size="lg"
    :title="$t('modalTitleAddNews')"
    :ok-title="$t('genericAdd')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing news add form -->
    <b-form @submit.stop.prevent>
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group
            :label="$t('formLabelNewsType')"
            label-for="newsType">
            <b-form-select id="newsType" :options="newsTypeSelect" v-model="newsTypeId" required autofocus/>
          </b-form-group>
          <b-form-group
            :label="$t('formLabelNewsTitle')"
            label-for="newsTitle">
            <b-form-input id="newsTitle" v-model="newsTitle" required/>
          </b-form-group>
          <b-form-group
            :label="$t('formLabelNewsUrl')"
            label-for="newsUrl">
            <b-form-input id="newsUrl" type="url" v-model="newsUrl"/>
          </b-form-group>
          <b-form-group
            v-if="newsTypeId === 4"
            :label="$t('formLabelNewsImage')"
            label-for="newsImage">
            <b-form-file v-model="imageFile" id="newsImage" accept=".jpeg, .png, .jpg" :state="Boolean(imageFile)" :placeholder="$t('pageDataUploadFilePlaceholder')" />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6">
          <b-form-group
            :label="$t('formLabelNewsDate')"
            label-for="newsDate">
            <b-form-datepicker id="newsDate" v-model="newsDate" />
          </b-form-group>
          <b-form-group
            :label="$t('formLabelNewsContent')"
            label-for="newsContent">
            <b-form-textarea :rows="newsTypeId === 4 ? 9 : 5" id="newsContent" v-model="newsContent"/>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
  </b-modal>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      newsTitle: null,
      newsContent: null,
      newsTypeId: 1,
      newsUrl: null,
      newsDate: null,
      imageFile: null,
      newsTypeSelect: [{
        value: 1,
        text: this.$t('widgetNewsTypeGeneralNews')
      }, {
        value: 2,
        text: this.$t('widgetNewsTypeGeneralUpdates')
      }, {
        value: 3,
        text: this.$t('widgetNewsTypeDataChanges')
      }, {
        value: 4,
        text: this.$t('widgetNewsTypeRelatedProject')
      }]
    }
  },
  computed: {
    canContinue: function () {
      return this.newsTitle && this.newsContent && this.newsTypeId
    }
  },
  mixins: [ miscApi ],
  methods: {
    okPressed: async function () {
      let imageBase64 = null
      if (this.newsTypeId !== 4) {
        this.imageFile = null
      } else if (this.imageFile) {
        imageBase64 = await this.toBase64(this.imageFile)
      }

      let news = {
        newstypeId: this.newsTypeId,
        title: this.newsTitle,
        content: this.newsContent,
        hyperlink: this.newsUrl,
        image: imageBase64,
        createdOn: this.newsDate,
        updatedOn: this.newsDate
      }

      this.apiPostNews(news, result => {
        this.$emit('news-added')
        this.hide()
      })
    },
    toBase64: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    show: function () {
      this.newsTitle = null
      this.newsContent = null
      this.newsUrl = null
      this.imageFile = null
      this.newsDate = new Date()
      this.newsTypeId = 1
      this.$refs.addNewsModal.show()
    },
    hide: function () {
      this.$refs.addNewsModal.hide()
    }
  }
}
</script>

<style>

</style>
