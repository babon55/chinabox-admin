<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopbar  from '@/components/layout/TheTopbar.vue'

const route      = useRoute()
const ui         = useUiStore()
const showLayout = computed(() => route.name !== 'login')
const mainMargin = computed(() => ui.collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)')
</script>

<template>
  <div v-if="showLayout" class="shell">
    <TheSidebar />
    <div class="main" :style="{ marginLeft: mainMargin }">
      <TheTopbar />
      <div class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>

  <RouterView v-else />
</template>

<style scoped>
.shell { display: flex; min-height: 100vh; background: var(--content-bg); }
.main  { flex: 1; display: flex; flex-direction: column; min-width: 0; transition: margin-left .28s cubic-bezier(.4,0,.2,1); }
.content { flex: 1; padding: 28px; overflow-y: auto; }
.page-enter-active, .page-leave-active { transition: opacity .15s, transform .15s; }
.page-enter-from  { opacity: 0; transform: translateY(6px); }
.page-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>
