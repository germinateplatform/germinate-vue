import { authAxios, authForm, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { AboutConfig, CarouselConfig, ClientAdminConfiguration, ClientConfiguration, LocaleConfig, TemplateI18n } from '@/plugins/types/germinate'
import { uuidv4 } from '@/plugins/util'

export function apiGetSettings (onSuccess?: GerminateResponseHandler<ClientConfiguration>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings', success: onSuccess, error: onError })
}

export function apiGetAdminSettings (onSuccess?: GerminateResponseHandler<ClientAdminConfiguration>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/admin', success: onSuccess, error: onError })
}

export function apiPostAdminSettings (queryData: ClientAdminConfiguration, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/admin', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostAboutPartner (formData: FormData, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authForm({ url: 'settings/about', method: 'POST', formData, success: onSuccess, error: onError })
}

export function apiGetTemplateCarouselConfig (onSuccess?: GerminateResponseHandler<CarouselConfig>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/carousel', success: onSuccess, error: onError })
}

export function apiGetTemplateAboutConfig (onSuccess?: GerminateResponseHandler<AboutConfig>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/about', success: onSuccess, error: onError })
}

export function apiPostTemplateCarouselConfig (data: CarouselConfig, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/carousel', method: 'POST', data, success: onSuccess, error: onError })
}

export function apiPatchTemplateAboutConfig (data: AboutConfig, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'settings/about', method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiPatchTemplateI18n (data: TemplateI18n, locale: string, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: `settings/template/i18n/${locale}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiGetLocales (onSuccess?: GerminateResponseHandler<LocaleConfig[]>, onError?: ErrorHandler) {
  authAxios({ url: `clientlocale?random=${uuidv4()}`, success: onSuccess, error: onError })
}
