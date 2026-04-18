import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Lang } from '@/types'

export const useUiStore = defineStore('ui', () => {
  const lang      = ref<Lang>('tk')
  const collapsed = ref(false)

  function toggleSidebar() { collapsed.value = !collapsed.value }
  function setLang(l: Lang) { lang.value = l }

  const sidebarOffset = computed(() =>
    collapsed.value ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'
  )

  const pageTitles: Record<string, Record<Lang, string>> = {
    '/dashboard': { tk: 'Dolandyryş paneli', ru: 'Панель управления' },
    '/products':  { tk: 'Önümler',           ru: 'Товары'            },
    '/orders':    { tk: 'Sargytlar',         ru: 'Заказы'            },
    '/customers': { tk: 'Müşderiler',        ru: 'Клиенты'           },
    '/analytics': { tk: 'Statistika',        ru: 'Аналитика'         },
    '/settings':  { tk: 'Sazlamalar',        ru: 'Настройки'         },
    '/requests':  { tk: 'Sargytlar',         ru: 'Заказы'            },
    '/comments':  { tk: 'Sargytlar',         ru: 'Заказы'            },
  }

  function pageTitle(path: string) {
    return pageTitles[path]?.[lang.value] ?? 'Admin'
  }

  return { lang, collapsed, toggleSidebar, setLang, sidebarOffset, pageTitle }
})
