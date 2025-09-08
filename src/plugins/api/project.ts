import { type ErrorHandler, authAxios, authForm } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedRequest } from '@/plugins/types/germinate'

const apiPostProjectTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProjectTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'project/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProject = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'project', formData, success: onSuccess, error: onError })

const apiPatchProject = <T>(projectId: number, formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: `project/${projectId}`, method: 'patch', formData, success: onSuccess, error: onError })

const apiDeleteProject = <T>(projectId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `project/${projectId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetProjectStats = <T>(projectId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `project/${projectId}/stats`, success: onSuccess, error: onError })

export {
  apiPostProjectTable,
  apiPostProjectTableIds,
  apiPostProject,
  apiPatchProject,
  apiDeleteProject,
  apiGetProjectStats,
}
