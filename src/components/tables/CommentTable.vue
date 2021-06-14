<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="getFilter()"
               :tableActions="tableActions"
               v-bind="$props"
               ref="commentTable"
               v-on="$listeners">
      <!-- Comment type -->
      <template v-slot:cell(commentType)="data">
        <span class="text-nowrap"><i :class="`mdi mdi-18px ${commentTypes[data.item.commentType].icon} fix-alignment`" :style="`color: ${commentTypes[data.item.commentType].color()};`" /> {{ commentTypes[data.item.commentType].text() }}</span>
      </template>
      <!-- Additional actions column holding the delete button -->
      <template v-slot:cell(actions)="data">
        <div v-if="token && token.id === data.item.userId">
          <b-button size="sm" variant="outline-danger" v-b-tooltip:hover :title="$t('tooltipDelete')" @click="deleteComment(data.item)"><i class="mdi mdi-18px mdi-delete" /></b-button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal containing the input field for new comments -->
    <b-modal ref="commentModal"
             v-if="token"
             :title="$t('modalTitleAddComment')"
             :ok-title="$t('buttonSubmit')"
             :cancel-title="$t('buttonCancel')"
             :ok-disabled="newComment === null"
             @ok="addNewComment">
      <b-form @submit.prevent.stop="addNewComment">
        <b-form-input v-model="newComment" required autofocus />
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import miscApi from '@/mixins/api/misc.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'CompoundTable',
  props: {
    ...defaultProps.BASE,
    commentTypeId: {
      type: Number,
      default: 1
    },
    referenceId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      options: {
        idColumn: 'commentId',
        tableName: 'comments',
        orderBy: 'updatedOn',
        orderByDesc: true
      },
      newComment: null,
      tableActions: [{
        id: 0,
        text: this.$t('tooltipAddNewComment'),
        variant: null,
        disabled: () => !this.token,
        icon: 'mdi mdi-18px mdi-plus-box',
        callback: () => {
          this.newComment = ''

          this.$nextTick(() => this.$refs.commentModal.show())
        }
      }]
    }
  },
  watch: {
    commentTypeId: function () {
      this.refresh()
    },
    referenceId: function () {
      this.refresh()
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'commentId',
        type: Number,
        class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'commentId')}`,
        sortable: true,
        label: this.$t('tableColumnCommentId')
      }, {
        key: 'commentTypeId',
        type: Number,
        class: `${this.isTableColumnHidden(this.options.tableName, 'commentTypeId')}`,
        sortable: true,
        label: this.$t('tableColumnCommentTypeId')
      }, {
        key: 'commentType',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'commentType')}`,
        sortable: true,
        label: this.$t('tableColumnCommentType')
      }, {
        key: 'commentForeignId',
        type: Number,
        class: `${this.isTableColumnHidden(this.options.tableName, 'commentForeignId')}`,
        sortable: true,
        label: this.$t('tableColumnCommentForeignId')
      }, {
        key: 'userName',
        type: String,
        class: `${this.isTableColumnHidden(this.options.tableName, 'userName')}`,
        sortable: true,
        label: this.$t('tableColumnCommentUserName')
      }, {
        key: 'commentContent',
        type: 'json',
        class: `${this.isTableColumnHidden(this.options.tableName, 'commentContent')}`,
        sortable: true,
        label: this.$t('tableColumnCommentContent'),
        preferedSortingColumn: true
      }, {
        key: 'updatedOn',
        type: Date,
        class: `${this.isTableColumnHidden(this.options.tableName, 'updatedOn')}`,
        sortable: true,
        label: this.$t('tableColumnCommentUpdatedOn'),
        formatter: this.$options.filters.toDateTime
      }, {
        key: 'actions',
        type: undefined,
        class: 'text-right',
        sortable: false,
        label: ''
      }]
    }
  },
  components: {
    BaseTable
  },
  mixins: [ miscApi, typesMixin ],
  methods: {
    getFilter: function () {
      return [{
        column: {
          name: 'commentTypeId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.commentTypeId],
        canBeChanged: false
      }, {
        column: {
          name: 'commentForeignId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.referenceId],
        canBeChanged: false
      }]
    },
    refresh: function () {
      this.$refs.commentTable.refresh()
    },
    deleteComment: function (comment) {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            // Delete the comment
            this.apiDeleteComment(comment.commentId, () => {
              this.refresh()
            })
          }
        })
    },
    addNewComment: function () {
      if (this.newComment && this.newComment.length > 0) {
        // Submit the new comment
        const data = {
          commenttypeId: this.commentTypeId,
          userId: this.token ? this.token.id : null,
          description: this.newComment,
          referenceId: this.referenceId
        }
        this.apiPutComment(data, () => {
          this.refresh()
          this.$refs.commentModal.hide()
        })
      }
    }
  }
}
</script>

<style>
</style>
