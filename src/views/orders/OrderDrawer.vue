<script setup lang="ts">
import { computed } from 'vue'
import type { OrderItem, OrderStatus, Lang } from '@/types'

const props = defineProps<{
  order: OrderItem | null
  lang:  Lang
  open:  boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'statusChange', id: string, status: OrderStatus): void
}>()

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; tk: string; ru: string; icon: string }> = {
  PENDING:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  tk: 'Garaşylýar', ru: 'Ожидает',     icon: 'clock'  },
  PROCESSING: { color: '#3B82F6', bg: 'rgba(59,130,246,.12)',  tk: 'Işlenýär',   ru: 'В обработке', icon: 'gear'   },
  SHIPPED:    { color: '#8B5CF6', bg: 'rgba(139,92,246,.12)',  tk: 'Iberildi',   ru: 'Отправлен',   icon: 'truck'  },
  DELIVERED:  { color: '#22C55E', bg: 'rgba(34,197,94,.12)',   tk: 'Eltildi',    ru: 'Доставлен',   icon: 'check'  },
  CANCELLED:  { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   tk: 'Ýatyryldy', ru: 'Отменён',     icon: 'cross'  },
}

const statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const L = computed(() => props.lang === 'tk' ? {
  title:    'Sargyt maglumaty',
  customer: 'Müşderi',
  contact:  'Habarlaşmak',
  address:  'Salgy',
  items:    'Harytlar',
  summary:  'Jemi hasap',
  subtotal: 'Aralyk jemi',
  shipping: 'Eltip beriş',
  total:    'Jemi',
  status:   'Ýagdaýy üýtget',
  note:     'Bellik',
  free:     'Mugt',
  close:    'Ýap',
  qty:      'sany',
} : {
  title:    'Детали заказа',
  customer: 'Клиент',
  contact:  'Контакты',
  address:  'Адрес',
  items:    'Товары',
  summary:  'Итого',
  subtotal: 'Подытог',
  shipping: 'Доставка',
  total:    'Итого',
  status:   'Изменить статус',
  note:     'Примечание',
  free:     'Бесплатно',
  close:    'Закрыть',
  qty:      'шт.',
})

const subtotal = computed(() =>
  props.order?.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) ?? 0
)
const shipping = computed(() => subtotal.value >= 50 ? 0 : 4.99)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="open" class="backdrop" @click="emit('close')" />
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <div v-if="open && order" class="drawer">

        <!-- Header -->
        <div class="drawer-head">
          <div>
            <p class="drawer-subtitle">{{ L.title }}</p>
            <h2 class="drawer-title">{{ order.id }}</h2>
          </div>
          <button class="close-btn" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="drawer-body">

          <!-- Current status badge -->
          <div class="current-status"
            :style="{ color: STATUS_CONFIG[order.status].color, background: STATUS_CONFIG[order.status].bg, borderColor: STATUS_CONFIG[order.status].color + '40' }"
          >
            <svg v-if="STATUS_CONFIG[order.status].icon==='clock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <svg v-if="STATUS_CONFIG[order.status].icon==='gear'"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg v-if="STATUS_CONFIG[order.status].icon==='truck'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <svg v-if="STATUS_CONFIG[order.status].icon==='check'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-if="STATUS_CONFIG[order.status].icon==='cross'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ STATUS_CONFIG[order.status][lang] }}
          </div>

          <!-- Customer info -->
          <div class="section">
            <p class="section-label">{{ L.customer }}</p>
            <div class="info-card">
              <div class="info-avatar">{{ order.customer[0] }}</div>
              <div>
                <p class="info-name">{{ order.customer }}</p>
                <p class="info-date">{{ order.date }}</p>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="section">
            <p class="section-label">{{ L.contact }}</p>
            <div class="detail-list">
              <div class="detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>{{ order.email }}</span>
              </div>
              <div class="detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{{ order.phone }}</span>
              </div>
              <div class="detail-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ order.address }}</span>
              </div>
            </div>
          </div>

          <!-- Order lines -->
          <div class="section">
            <p class="section-label">{{ L.items }}</p>
            <div class="lines">
              <div v-for="line in order.lines" :key="line.productId" class="line-row">
                <div class="line-thumb">{{ line.image }}</div>
                <div class="line-info">
                  <p class="line-name">{{ line.name[lang] }}</p>
                  <!-- Options display removed; use OrdersView drawer instead -->
                  <p class="line-meta">{{ line.qty }} {{ L.qty }} × ${{ line.unitPrice.toFixed(2) }}</p>
                </div>
                <span class="line-total">${{ (line.qty * line.unitPrice).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="section">
            <p class="section-label">{{ L.summary }}</p>
            <div class="summary-box">
              <div class="sum-row">
                <span>{{ L.subtotal }}</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="sum-row">
                <span>{{ L.shipping }}</span>
                <span :style="shipping === 0 ? { color: 'var(--success)', fontWeight: 700 } : {}">
                  {{ shipping === 0 ? L.free : `$${shipping.toFixed(2)}` }}
                </span>
              </div>
              <div class="sum-row total-row">
                <span>{{ L.total }}</span>
                <span>${{ order.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div v-if="order.note" class="section">
            <p class="section-label">{{ L.note }}</p>
            <p class="note-text">{{ order.note }}</p>
          </div>

          <!-- Status change -->
          <div class="section">
            <p class="section-label">{{ L.status }}</p>
            <div class="status-grid">
              <button
                v-for="s in statuses" :key="s"
                :class="['status-btn', { active: order.status === s }]"
                :style="order.status === s ? { borderColor: STATUS_CONFIG[s].color, color: STATUS_CONFIG[s].color, background: STATUS_CONFIG[s].bg } : {}"
                @click="emit('statusChange', order.id, s)"
              >
                {{ STATUS_CONFIG[s][lang] }}
              </button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="drawer-foot">
          <button class="btn-close" @click="emit('close')">{{ L.close }}</button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(15,17,23,.45); backdrop-filter: blur(2px); }
.fade-enter-active, .fade-leave-active { transition: opacity .22s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Drawer */
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 201;
  width: 100%; max-width: 480px;
  background: var(--white);
  box-shadow: -8px 0 32px rgba(0,0,0,.12);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.drawer-enter-active, .drawer-leave-active { transition: transform .28s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

/* Head */
.drawer-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 22px 24px; border-bottom: 1px solid var(--border-light); flex-shrink: 0;
}
.drawer-subtitle { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 3px; }
.drawer-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.close-btn { width: 30px; height: 30px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .15s; flex-shrink: 0; }
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Scrollable body */
.drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 22px; }

/* Current status */
.current-status {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: var(--radius-pill);
  font-size: 13px; font-weight: 700;
  border: 1.5px solid transparent; width: fit-content;
}
.current-status svg { width: 15px; height: 15px; }

/* Sections */
.section { display: flex; flex-direction: column; gap: 10px; }
.section-label { font-size: 11px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }

/* Info card */
.info-card { display: flex; align-items: center; gap: 12px; background: var(--surface); border-radius: var(--radius-lg); padding: 12px 14px; border: 1.5px solid var(--border-light); }
.info-avatar { width: 38px; height: 38px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info-name { font-size: 14px; font-weight: 700; color: var(--dark); margin-bottom: 2px; }
.info-date { font-size: 12px; color: var(--subtle); }

/* Detail list */
.detail-list { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.detail-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border-light); font-size: 13px; color: var(--dark); }
.detail-row:last-child { border-bottom: none; }
.detail-row svg { width: 15px; height: 15px; color: var(--subtle); flex-shrink: 0; }

/* Order lines */
.lines { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.line-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--border-light); }
.line-row:last-child { border-bottom: none; }
.line-thumb { width: 38px; height: 38px; border-radius: var(--radius-md); background: var(--white); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; border: 1.5px solid var(--border-light); }
.line-info { flex: 1; min-width: 0; }
.line-name { font-size: 13px; font-weight: 600; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.line-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 2px;
}
.line-opt {
  font-size: 11px;
  color: var(--subtle);
  background: var(--surface);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-light);
}
.line-opt strong {
  color: var(--gold);
  font-weight: 700;
}
.line-meta { font-size: 11px; color: var(--subtle); }
.line-total { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-display); flex-shrink: 0; }

/* Summary box */
.summary-box { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }
.total-row { padding-top: 8px; border-top: 1px solid var(--border); font-size: 15px; font-weight: 700; color: var(--dark); font-family: var(--font-display); }

/* Note */
.note-text { font-size: 13px; color: var(--muted); background: var(--surface); border-radius: var(--radius-md); padding: 10px 14px; border: 1.5px solid var(--border-light); line-height: 1.5; }

/* Status change buttons */
.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.status-btn { padding: 8px 4px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); text-align: center; }
.status-btn:hover:not(.active) { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.status-btn.active { font-size: 12px; }

/* Footer */
.drawer-foot { padding: 16px 24px; border-top: 1px solid var(--border-light); flex-shrink: 0; }
.btn-close { width: 100%; height: 40px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 700; color: var(--muted); cursor: pointer; transition: all .15s; font-family: var(--font-body); }
.btn-close:hover { border-color: var(--dark); color: var(--dark); background: var(--white); }
</style>
