<template>
  <b-modal
    ref="addProjectModal"
    size="xl"
    :title="$t('modalTitleAddProject')"
    :ok-title="$t(projectToEdit ? 'buttonUpdate' : 'genericAdd')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing news add form -->
    <b-form @submit.stop.prevent>
      <b-row>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectName')"
            label-for="name">
            <b-form-input id="name" v-model="name" required/>
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectDescription')"
            label-for="description">
            <b-form-textarea :rows=4 id="description" v-model="description" />
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectPageContent')"
            label-for="pageContent">
            <b-form-textarea :rows=10 id="pageContent" v-model="pageContent" />
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectPageContentPreview')"
            label-for="preview">
            <VueMarkdown id="preview" class="form-control" :source="pageContent" v-if="pageContent" />
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectStartDate')"
            label-for="startDate">
            <b-form-input id="startDate" type="date" v-model="startDate"/>
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectEndDate')"
            label-for="endDate">
            <b-form-input id="endDate" type="date" v-model="endDate"/>
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectExternalUrl')"
            label-for="externalUrl">
            <b-form-input id="externalUrl" type="url" v-model="externalUrl"/>
          </b-form-group>
        </b-col>
        <b-col :cols=12 :md=6>
          <b-form-group
            :label="$t('formLabelProjectImage')"
            label-for="image">
            <b-form-file v-model="imageFile" id="image" accept=".jpeg, .png, .jpg" :state="Boolean(imageFile)" :placeholder="$t('pageDataUploadFilePlaceholder')" />
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
  </b-modal>
</template>

<script>
import VueMarkdown from '@adapttive/vue-markdown'
import { apiPatchProject, apiPostProject } from '@/mixins/api/project'

export default {
  components: {
    VueMarkdown
  },
  props: {
    projectToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      id: null,
      name: null,
      description: null,
      pageContent: null,
      startDate: null,
      endDate: null,
      externalUrl: null,
      imageFile: null
    }
  },
  computed: {
    canContinue: function () {
      return this.name && this.name !== '' && this.name.length < 255
    }
  },
  methods: {
    okPressed: async function () {
      const formData = new FormData()
      formData.append('name', this.name)
      if (this.description && this.description !== '') {
        formData.append('description', this.description)
      }
      if (this.pageContent && this.pageContent !== '') {
        formData.append('pageContent', this.pageContent)
      }
      if (this.startDate && this.startDate !== '') {
        formData.append('startDate', this.startDate)
      }
      if (this.endDate && this.endDate !== '') {
        formData.append('endDate', this.endDate)
      }
      if (this.externalUrl && this.externalUrl !== '') {
        formData.append('externalUrl', this.externalUrl)
      }

      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }

      if (this.id) {
        apiPatchProject(this.id, formData, () => {
          this.$emit('projects-changed')
          this.hide()
        })
      } else {
        apiPostProject(formData, () => {
          this.$emit('projects-changed')
          this.hide()
        })
      }
    },
    show: function () {
      if (this.projectToEdit) {
        this.id = this.projectToEdit.projectId
        this.name = this.projectToEdit.projectName
        this.description = this.projectToEdit.projectDescription
        this.pageContent = this.projectToEdit.projectPageContent
        this.externalUrl = this.projectToEdit.projectExternalUrl
        this.startDate = this.projectToEdit.projectStartDate ? this.projectToEdit.projectStartDate.split('T')[0] : null
        this.endDate = this.projectToEdit.projectEndDate ? this.projectToEdit.projectEndDate.split('T')[0] : null
        this.imageFile = null
      } else {
        this.id = null
        this.name = null
        this.description = null
        this.pageContent = null
        this.startDate = null
        this.externalUrl = null
        this.endDate = null
        this.imageFile = null
      }
      this.$refs.addProjectModal.show()
    },
    hide: function () {
      this.id = null
      this.name = null
      this.description = null
      this.pageContent = null
      this.startDate = null
      this.externalUrl = null
      this.endDate = null
      this.imageFile = null

      this.$refs.addProjectModal.hide()
    }
  }
}
</script>

<style scoped>
#preview {
  height: auto;
  max-height: min(50vh, 300px);
  overflow-y: auto;
}
</style>
