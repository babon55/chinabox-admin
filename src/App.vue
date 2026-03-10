<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheTopbar  from '@/components/layout/TheTopbar.vue'

const ui    = useUiStore()
const route = useRoute()

const contentStyle = computed(() => ({
  marginLeft: ui.sidebarOffset,
  paddingTop: 'var(--topbar-h)',
}))
</script>

<template>
  <div class="shell">
    <TheSidebar />
    <TheTopbar :title="ui.pageTitle(route.path)" />
    <main class="content" :style="contentStyle">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.shell { min-height: 100vh; }
.content {
  min-height: 100vh;
  padding: 28px;
  transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (max-width: 768px) {
  .content { margin-left: 0 !important; padding: 16px; }
}
</style>
