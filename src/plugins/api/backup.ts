import type { BackupResult, PaginatedRequest, PaginatedResult } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiGetBackups (onSuccess?: GerminateResponseHandler<BackupResult[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'backup', method: 'GET', success: onSuccess, error: onError })
}

export function apiPostBackupTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<BackupResult[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'backup/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiDeleteBackup (backup: BackupResult, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'backup', method: 'DELETE', data: backup, success: onSuccess, error: onError })
}

export function apiPutBackup (onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'backup', method: 'PUT', success: onSuccess, error: onError })
}
