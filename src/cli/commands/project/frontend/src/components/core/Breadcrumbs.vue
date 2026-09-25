<script setup lang="ts">
import Folder from "../icons/Folder.vue";

defineProps<{
  crumbs: string[];
  compact: boolean;
}>();
</script>

<template>
  <div class="flex items-center text-xs gap-x-1 w-full breadcrumbs" :class="{ 'pr-6': !compact }">
    <Folder class="stroke-mist-800/60 dark:stroke-mist-400 size-3 stroke-2"></Folder>
    <div class="w-full">
      <div v-if="crumbs.length >= 3" class="text-zinc-500 dark:text-mist-500 flex items-center gap-x-1">
        <span>...</span>
        <span>></span>
        <span class="text-mist-800/60 dark:text-mist-400 line-clamp-1">{{ "/" + crumbs.slice(crumbs.length - 1)[0] }}</span>
      </div>

      <div v-else class="flex items-center gap-x-1 w-full">
        <div v-for="(crumb, index) in crumbs" :key="`${index}-${crumb}`" class="flex items-center gap-x-1 text-zinc-500 dark:text-mist-500">
          <span
            class="line-clamp-1"
            :class="{
              'text-mist-800/60 dark:text-mist-400': index === crumbs.length - 1,
              hidden: compact && index !== crumbs.length - 1,
            }"
          >
            {{ index === 0 ? "./" : "/" }}{{ crumb }}
          </span>
          <span :class="{ hidden: compact || index === crumbs.length - 1 }">></span>
        </div>
      </div>

      <div v-if="crumbs.length === 0">
        <span class="text-mist-800/60 dark:text-mist-400">.</span>
      </div>
    </div>
  </div>
</template>
