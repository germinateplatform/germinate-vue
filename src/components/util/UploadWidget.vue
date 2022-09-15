<template>
<div>
  <div v-show="$refs.upload && $refs.upload.dropActive" class="drop-active">
    <h3>{{ $t('widgetDataUploadLabelDragDrop') }}</h3>
  </div>
  <div class="upload">
    <b-table hover
            sticky-header="60vh"
            responsive
            show-empty
            :empty-text="$t('widgetDataUploadLabelDropTable')"
            head-variant="dark"
            :items="files"
            :fields="fields"
            class="file-table">
      <template #cell(thumb)="data">
        <img class="td-image-thumb" v-if="data.item.thumb" :src="data.item.thumb" />
        <span v-else>{{ $t('widgetDataUploadLabelNoImage') }}</span>
      </template>
      <template #cell(name)="data">
        <div class="filename">{{ data.item.name }}</div>
        <div class="progress" v-if="data.item.active || data.item.progress !== '0.00'">
          <div :class="{'progress-bar': true, 'progress-bar-striped': true, 'bg-success': data.item.success, 'bg-danger': data.item.error, 'progress-bar-animated': data.item.active}" role="progressbar" :style="{width: data.item.progress + '%'}">{{data.item.progress}}%</div>
        </div>
      </template>
      <template #cell(width)="data">
        {{data.item.width || 'N/A'}}
      </template>
      <template #cell(height)="data">
        {{data.item.height || 'N/A'}}
      </template>
      <template #cell(size)="data">
        {{ getNumberWithSuffix(data.item.size, 1, 1024, ' ') }}
      </template>
      <template #cell(speed)="data">
        <span v-if="data.item.speed">{{getNumberWithSuffix(data.item.speed, 1, 1024, ' ')}}/s</span>
      </template>
      <template #cell(status)="data">
        <b-badge variant="danger" v-if="data.item.error">{{data.item.error}}</b-badge>
        <b-badge variant="success" v-else-if="data.item.success">{{ $t('genericSuccess') }}</b-badge>
        <b-badge variant="info" v-else-if="data.item.active">{{ $t('genericActive') }}</b-badge>
        <span v-else></span>
      </template>
      <template #cell(actions)="data">
        <b-dropdown right>
          <b-dropdown-item :disabled="!data.item.active" @click="data.item.active ? $refs.upload.update(data.item, {error: 'cancel'}) : false">{{ $t('genericCancel') }}</b-dropdown-item>
          <b-dropdown-item v-if="data.item.active" @click="$refs.upload.update(data.item, {active: false})">{{ $t('genericCancel') }}</b-dropdown-item>
          <b-dropdown-item v-else-if="data.item.error && data.item.error !== 'compressing' && data.item.error !== 'image parsing' && $refs.upload.features.html5" @click="$refs.upload.update(data.item, {active: true, error: '', progress: '0.00'})">{{ $t('genericRetry') }}</b-dropdown-item>
          <b-dropdown-item :disabled="data.item.success || data.item.error === 'compressing' || data.item.error === 'image parsing'" v-else @click="data.item.success || data.item.error === 'compressing' || data.item.error === 'image parsing' ? false : $refs.upload.update(data.item, {active: true})">{{ $t('buttonUpload') }}</b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item @click="$refs.upload.remove(data.item)">{{ $t('genericRemove') }}</b-dropdown-item>
        </b-dropdown>
      </template>
    </b-table>

    <div>
      <div>
        <file-upload
          class="btn btn-secondary mb-3"
          :post-action="postAction"
          :accept="accept"
          :multiple="multiple"
          :thread="thread < 1 ? 1 : (thread > 5 ? 5 : thread)"
          :headers="headers"
          :drop="drop"
          :name="name"
          v-model="files"
          @input-filter="inputFilter"
          @input-file="inputFile"
          ref="upload">
          <MdiIcon :path="mdiFilePlusOutline" /> {{ $t('genericAdd') }}
        </file-upload>
      </div>
      <template v-if="files && files.length > 0">
        <b-button variant="success" @click="$refs.upload.active = true" v-if="!$refs.upload || !$refs.upload.active"><MdiIcon :path="mdiUpload" /> {{ $t('widgetDataUploadLabelStartUpload') }}</b-button>
        <b-button variant="danger" @click="$refs.upload.active = false" v-else><MdiIcon :path="mdiCancel" /> {{ $t('widgetDataUploadLabelStopUpload') }}</b-button>
      </template>
    </div>
  </div>
</div>
</template>

<script>
import { getNumberWithSuffix } from '@/mixins/formatting'
import { getToken } from '@/mixins/api/base'
import FileUpload from 'vue-upload-component'
import MdiIcon from '@/components/icons/MdiIcon'

import { mdiFilePlusOutline, mdiUpload, mdiCancel } from '@mdi/js'

export default {
  components: {
    FileUpload,
    MdiIcon
  },
  props: {
    postAction: {
      type: String,
      default: null
    },
    accept: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: 'file'
    }
  },
  data () {
    return {
      mdiFilePlusOutline,
      mdiUpload,
      mdiCancel,
      files: [],
      multiple: true,
      drop: true,
      thread: 3,
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      uploadAuto: false,
      fields: [
        { key: 'thumb', label: this.$t('tableColumnDataUploadThumb') },
        { key: 'name', label: this.$t('tableColumnDataUploadName') },
        { key: 'width', label: this.$t('tableColumnDataUploadWidth') },
        { key: 'height', label: this.$t('tableColumnDataUploadHeight') },
        { key: 'size', label: this.$t('tableColumnDataUploadSize') },
        { key: 'speed', label: this.$t('tableColumnDataUploadSpeed') },
        { key: 'status', label: this.$t('tableColumnDataUploadStatus') },
        { key: 'actions', label: this.$t('tableColumnDataUploadActions') }
      ]
    }
  },
  methods: {
    getNumberWithSuffix,
    clear: function () {
      this.$refs.upload.clear()
    },
    inputFilter (newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // Before adding a file
        // Filter system files or hide files
        if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
          return prevent()
        }
        // Filter php html js file
        if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
          return prevent()
        }
      }
      if (newFile && newFile.error === '' && newFile.file && (!oldFile || newFile.file !== oldFile.file)) {
        // Create a blob field
        newFile.blob = ''
        const URL = (window.URL || window.webkitURL)
        if (URL) {
          newFile.blob = URL.createObjectURL(newFile.file)
        }
        // Thumbnails
        newFile.thumb = ''
        if (newFile.blob && newFile.type.substr(0, 6) === 'image/') {
          newFile.thumb = newFile.blob
        }
      }
      // image size
      if (newFile && newFile.error === '' && newFile.type.substr(0, 6) === 'image/' && newFile.blob && (!oldFile || newFile.blob !== oldFile.blob)) {
        newFile.error = this.$t('widgetDataUploadLabelParsingImage')
        const img = new Image()
        img.onload = () => {
          this.$refs.upload.update(newFile, { error: '', height: img.height, width: img.width })
        }
        img.οnerrοr = () => this.$refs.upload.update(newFile, { error: 'parsing image size' })
        img.src = newFile.blob
      }
    },
    // add, update, remove File Event
    inputFile (newFile, oldFile) {
      if (newFile && oldFile) {
        // update
        if (newFile.active && !oldFile.active) {
          // beforeSend
          // min size
          if (newFile.size >= 0 && this.minSize > 0 && newFile.size < this.minSize) {
            this.$refs.upload.update(newFile, { error: 'size' })
          }
        }
        if (newFile.progress !== oldFile.progress) {
          // progress
        }
        if (newFile.error && !oldFile.error) {
          // error
        }
        if (newFile.success && !oldFile.success) {
          // success
        }
      }
      if (!newFile && oldFile) {
        // remove
        if (oldFile.success && oldFile.response.id) {
          // $.ajax({
          //   type: 'DELETE',
          //   url: '/upload/delete?id=' + oldFile.response.id,
          // })
        }
      }
      // Automatically activate upload
      if (Boolean(newFile) !== Boolean(oldFile) || oldFile.error !== newFile.error) {
        if (this.uploadAuto && !this.$refs.upload.active) {
          this.$refs.upload.active = true
        }
      }
    },
    alert (message) {
      alert(message)
    }
  }
}
</script>

<style>
.file-table {
  min-height: 300px;
}
.td-image-thumb {
  max-width: 4em;
  max-height: 4em;
}
.filename {
  margin-bottom: .3rem
}
.drop-active {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  position: fixed;
  z-index: 9999;
  opacity: .6;
  text-align: center;
  background: #000;
}
.drop-active h3 {
  margin: -.5em 0 0;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 40px;
  color: #fff;
  padding: 0;
}
</style>
