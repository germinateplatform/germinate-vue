<template>
  <div>
    <v-switch v-if="store.storeUserIsAdmin" v-model="editingEnabled" :label="$t('buttonEditPageContent')" color="primary" @click.prevent="askToConfirm" />

    <template v-if="editingEnabled">
      <QuillEditor content-type="delta" :modules="modules" :toolbar="toolbar" @text-change="listenForImageRemoval" ref="quill" />

      <v-btn class="mt-3" color="success" prepend-icon="mdi-content-save" :text="$t('buttonSave')" @click="save" />
    </template>
    <div v-html="$t(compProps.i18nKey)" v-else />
  </div>
</template>

<script setup lang="ts">
  import { apiDeleteTemplateImageByName, apiPatchTemplateI18n, apiPostTemplateImage } from '@/plugins/api/misc'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import ImageUploader from 'quill-image-uploader'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'

  const { t, locale } = useI18n()

  const compProps = defineProps<{
    i18nKey: string
  }>()

  const router = useRouter()
  const store = coreStore()
  const editingEnabled = ref(false)
  const quill = ref()
  const toolbar = ref([
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ align: [] }],
    ['link', 'image'],
  ])
  const modules = ref({
    name: 'imageUploader',
    module: ImageUploader,
    options: {
      upload: (file: File) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append('image', file)

          apiPostTemplateImage(formData, (result: string) => {
            resolve(getImageUrl(result, {
              name: result,
              type: 'template',
              size: 'large',
            }))
          })
        })
      },
    },
  })

  function getImgUrls (delta: any) {
    return delta.ops
      .filter((i: any) => i.insert && i.insert.image)
      .map((i: any) => i.insert.image)
  }

  function listenForImageRemoval (a: any) {
    if (a.source !== 'user') {
      return
    }

    const deleted = getImgUrls(quill.value.getContents().diff(a.oldContents))

    if (deleted) {
      deleted.forEach((d: string) => {
        if (d.startsWith(store.storeBaseUrl || 'http')) {
          const start = d.indexOf('src/') + 4
          const end = d.indexOf('?')

          const name = d.slice(start, end)

          apiDeleteTemplateImageByName(name, () => {
            console.log('success')
          })
        }
      })
    }
  }

  function askToConfirm () {
    if (editingEnabled.value === true) {
      emitter.emit('show-confirm', {
        title: t('modalTitleConfirm'),
        message: t('modalTextHtmlEditorLeaveSure'),
        okTitle: t('genericYes'),
        cancelTitle: t('genericNo'),
        okVariant: 'warning',
        callback: (result: boolean) => {
          if (result === true) {
            editingEnabled.value = false
          } else {
            editingEnabled.value = true
          }
        },
      })
    } else {
      editingEnabled.value = true
    }
  }

  function save () {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'warning',
      callback: (result: boolean) => {
        if (result === true) {
          const payload: { [key: string]: string } = {}
          payload[compProps.i18nKey] = quill.value.getHTML()

          apiPatchTemplateI18n(payload, store.storeLocale, () => {
            router.go(0)
          })
        }
      },
    })
  }

  function update () {
    quill.value?.setHTML(t(compProps.i18nKey))
  }

  onBeforeRouteLeave((to, from, next) => {
    if (store.storeUserIsAdmin && editingEnabled.value) {
      emitter.emit('show-confirm', {
        title: t('modalTitleConfirm'),
        message: t('modalTextHtmlEditorLeaveSure'),
        okTitle: t('genericYes'),
        cancelTitle: t('genericNo'),
        okVariant: 'warning',
        callback: (result: boolean) => {
          if (result === true) {
            next()
          }
        },
      })
    } else {
      next()
    }
  })

  watch(locale, () => update())
  watch(editingEnabled, async (newValue: boolean) => {
    if (newValue) {
      nextTick(() => update())
    }
  })
  watch(() => compProps.i18nKey, async () => update())
  onMounted(() => update())
</script>
