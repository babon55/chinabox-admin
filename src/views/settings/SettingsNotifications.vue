<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Lang } from '@/types'

const props = defineProps<{ lang: Lang }>()

const saved  = ref(false)
const saving = ref(false)

interface Toggle { key: string; label: Record<'tk'|'ru', string>; desc: Record<'tk'|'ru', string>; value: boolean }
interface Group  { key: string; title: Record<'tk'|'ru', string>; icon: string; color: string; toggles: Toggle[] }

const groups = ref<Group[]>([
  {
    key: 'orders', icon: 'orders', color: '#3B82F6',
    title: { tk: 'Sargytlar', ru: 'Заказы' },
    toggles: [
      { key: 'new_order',     label: { tk: 'Täze sargyt',           ru: 'Новый заказ'            }, desc: { tk: 'Müşderi täze sargyt berende habar ber', ru: 'Уведомлять при каждом новом заказе' }, value: true  },
      { key: 'status_change', label: { tk: 'Ýagdaý üýtgemesi',      ru: 'Изменение статуса'      }, desc: { tk: 'Sargydyň ýagdaýy üýtgände habar ber',  ru: 'При изменении статуса заказа'       }, value: true  },
      { key: 'cancellation',  label: { tk: 'Sargyt ýatyrylmasy',    ru: 'Отмена заказа'          }, desc: { tk: 'Müşderi sargydy ýatilanda habar ber',   ru: 'При отмене заказа клиентом'         }, value: true  },
    ],
  },
  {
    key: 'inventory', icon: 'stock', color: '#F59E0B',
    title: { tk: 'Stok', ru: 'Склад' },
    toggles: [
      { key: 'low_stock',  label: { tk: 'Az stok duýduryşy',  ru: 'Мало товара'      }, desc: { tk: '10 we az galsa habar ber',    ru: 'Уведомить когда остаток ≤ 10'    }, value: true  },
      { key: 'out_stock',  label: { tk: 'Stok gutardy',       ru: 'Товар закончился' }, desc: { tk: 'Önüm gutaranda habar ber',    ru: 'Когда товар полностью закончился' }, value: true  },
      { key: 'restock',    label: { tk: 'Stok dolduryşy',     ru: 'Пополнение'       }, desc: { tk: 'Stok doldurylanda habar ber', ru: 'При пополнении склада'            }, value: false },
    ],
  },
  {
    key: 'customers', icon: 'customers', color: '#22C55E',
    title: { tk: 'Müşderiler', ru: 'Клиенты' },
    toggles: [
      { key: 'new_customer', label: { tk: 'Täze müşderi',          ru: 'Новый клиент'     }, desc: { tk: 'Täze hasap açylanda habar ber',    ru: 'При регистрации нового клиента'  }, value: false },
      { key: 'review',       label: { tk: 'Täze syn',              ru: 'Новый отзыв'      }, desc: { tk: 'Müşderi syn galdyranda habar ber', ru: 'Когда клиент оставляет отзыв'   }, value: true  },
    ],
  },
  {
    key: 'system', icon: 'system', color: '#8B5CF6',
    title: { tk: 'Ulgam', ru: 'Система' },
    toggles: [
      { key: 'security',  label: { tk: 'Howpsuzlyk duýduryşy', ru: 'Предупреждения безопасности' }, desc: { tk: 'Şübheli işjeňlik üçin habar ber', ru: 'О подозрительной активности'    }, value: true  },
      { key: 'updates',   label: { tk: 'Ulgam täzelenmesi',    ru: 'Обновления системы'          }, desc: { tk: 'Täzelenme bolanda habar ber',     ru: 'Об обновлениях платформы'       }, value: false },
      { key: 'reports',   label: { tk: 'Gündelik hasabat',     ru: 'Ежедневный отчёт'            }, desc: { tk: 'Her gün statistika iberer',        ru: 'Присылать сводку каждый день'  }, value: true  },
    ],
  },
])

const L = computed(() => props.lang === 'tk' ? {
  title:  'Habarnamalar',
  sub:    'Haýsy wakalar üçin habar almak isleýändigiňizi saýlaň',
  save:   'Sazlamalary ýatda sakla',
  saved:  'Sazlamalar ýatda saklandy!',
  on:     'Açyk', off: 'Ýapyk',
} : {
  title:  'Уведомления',
  sub:    'Выберите о каких событиях хотите получать уведомления',
  save:   'Сохранить настройки',
  saved:  'Настройки сохранены!',
  on:     'Вкл', off: 'Выкл',
})

async function save() {
  saving.value = true
  await new Promise(r => setTimeout(r, 700))
  saving.value = false
  saved.value  = true
  setTimeout(() => { saved.value = false }, 2800)
}
</script>

<template>
  <div class="section">
    <div class="section-head">
      <h3>{{ L.title }}</h3>
      <p class="section-sub">{{ L.sub }}</p>
    </div>

    <div class="groups">
      <div v-for="group in groups" :key="group.key" class="group-card">
        <!-- Group header -->
        <div class="group-head">
          <div class="group-icon" :style="{ background: group.color + '18', color: group.color }">
            <svg v-if="group.icon==='orders'"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <svg v-if="group.icon==='stock'"     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <svg v-if="group.icon==='customers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-if="group.icon==='system'"    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <span class="group-title">{{ group.title[lang] }}</span>
        </div>

        <!-- Toggles -->
        <div class="toggles">
          <div v-for="t in group.toggles" :key="t.key" class="toggle-row">
            <div class="toggle-info">
              <p class="toggle-label">{{ t.label[lang] }}</p>
              <p class="toggle-desc">{{ t.desc[lang] }}</p>
            </div>
            <button :class="['toggle', { on: t.value }]" @click="t.value = !t.value"
              :aria-label="t.value ? L.on : L.off">
              <span class="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="form-footer">
      <Transition name="toast">
        <div v-if="saved" class="toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ L.saved }}
        </div>
      </Transition>
      <button class="save-btn" :class="{ loading: saving }" @click="save">
        <svg v-if="!saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <svg v-else class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        {{ L.save }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section { display: flex; flex-direction: column; gap: 0; }
.section-head { margin-bottom: 24px; }
.section-head h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.section-sub { font-size: 13px; color: var(--subtle); }

.groups { display: flex; flex-direction: column; gap: 16px; }

.group-card { background: var(--surface); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); overflow: hidden; }
.group-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border-light); background: var(--white); }
.group-icon { width: 34px; height: 34px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.group-icon svg { width: 16px; height: 16px; }
.group-title { font-size: 14px; font-weight: 700; color: var(--dark); }

.toggles { display: flex; flex-direction: column; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--border-light); transition: background .12s; }
.toggle-row:last-child { border-bottom: none; }
.toggle-row:hover { background: var(--white); }
.toggle-info { flex: 1; min-width: 0; }
.toggle-label { font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 2px; }
.toggle-desc  { font-size: 12px; color: var(--subtle); }

/* Toggle switch */
.toggle {
  width: 44px; height: 24px; border-radius: 12px;
  background: var(--border); border: none; cursor: pointer;
  position: relative; flex-shrink: 0;
  transition: background .22s cubic-bezier(.4,0,.2,1);
  padding: 0;
}
.toggle.on { background: var(--gold); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.18);
  transition: transform .22s cubic-bezier(.4,0,.2,1);
}
.toggle.on .toggle-thumb { transform: translateX(20px); }

.form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--border-light); gap: 12px; }
.save-btn { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 22px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); font-size: 13px; font-weight: 800; color: #fff; cursor: pointer; font-family: var(--font-body); transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow); }
.save-btn svg { width: 15px; height: 15px; }
.save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }
.save-btn.loading { opacity: .75; pointer-events: none; }

.toast { display: flex; align-items: center; gap: 8px; background: var(--success-bg); color: var(--success); border: 1.5px solid rgba(34,197,94,.3); border-radius: var(--radius-md); padding: 8px 14px; font-size: 13px; font-weight: 700; }
.toast svg { width: 15px; height: 15px; flex-shrink: 0; }
.toast-enter-active, .toast-leave-active { transition: opacity .2s, transform .2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-8px); }

.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
