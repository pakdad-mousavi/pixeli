<script setup lang="ts">
// Define image type
import type { useFilesStore } from "@/stores/files";
type Image = ReturnType<typeof useFilesStore>["formattedImages"]["0"];

import Breadcrumbs from "./Breadcrumbs.vue";
import { formatBytes } from "@/utils/formatBytes";
import FileUpload from "../icons/FileUpload.vue";
import { onMounted, ref, useTemplateRef, watch } from "vue";
import { animate, JSAnimation, svg } from "animejs";

const props = defineProps<{
  image: Image;
  isCompact: boolean;
  isSelected: boolean;
}>();

const tick = useTemplateRef("tick");
const animation = ref<JSAnimation | null>(null);

// Animation methods
const playAnimation = () => {
  if (!animation.value) return;
  animation.value.play();
};

const reverseAnimation = () => {
  if (!animation.value) return;
  animation.value.reverse();
};

// Play the animation when needed
watch(
  () => props.isSelected,
  (isSelected) => (isSelected ? playAnimation() : reverseAnimation()),
);

// Setup animation
onMounted(() => {
  if (!tick.value) return;

  animation.value = animate(svg.createDrawable(tick.value), {
    draw: ["0 0", "0 .018"],
    delay: 0,
    ease: "inOutQuad",
    duration: 300,
    autoplay: false,
  });

  if (props.isSelected) {
    playAnimation();
  }
});
</script>

<template>
  <div
    class="bg-white dark:bg-mist-800 p-2 rounded-lg flex items-center gap-4 border border-zinc-200 dark:border-mist-700 relative duration-300 transition-colors cursor-pointer"
    :class="{ 'border-rust! bg-gold/10! dark:border-gold!': isSelected }"
  >
    <div
      class="absolute top-2 right-2 border dark:border-mist-500 size-5 rounded-md flex justify-center items-center duration-300 transition-colors"
      :class="{ 'bg-zinc-200 dark:bg-mist-700': isSelected }"
    >
      <svg
        class="stroke-black dark:stroke-white tick"
        ref="tick"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12l5 5l10 -10" />
      </svg>
    </div>
    <div class="min-w-max">
      <img
        v-if="image.size < 5 * 1024 * 1024"
        :src="`/fs/preview?path=${encodeURIComponent(image.path)}`"
        :alt="image.path"
        class="object-cover rounded-md border size-20"
      />
      <div v-else class="flex justify-center items-center relative border rounded-md border-rust dark:border-gold size-20">
        <div class="absolute size-10 rounded-full bg-rust/50 dark:bg-gold/30 blur-xl"></div>
        <FileUpload class="size-10 stroke-rust dark:stroke-gold"></FileUpload>
      </div>
    </div>
    <div class="flex flex-col gap-3 w-full">
      <Breadcrumbs :crumbs="image.sections" :compact="isCompact"></Breadcrumbs>
      <span class="line-clamp-1">{{ image.name }}</span>
      <div class="text-xs flex gap-x-2">
        <span>{{ formatBytes(image.size, 0) }}</span>
        <span class="text-mist-800/60 dark:text-mist-500">•</span>
        <span class="text-mist-800/60 dark:text-mist-500">{{ image.width }} x {{ image.height }}</span>
      </div>
    </div>
  </div>
</template>
