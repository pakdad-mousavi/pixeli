<script setup lang="ts">
import Upload from '@/components/icons/Upload.vue';
import { traverseFileTree } from '@/utils/traverseFileTree';

import { ref, useTemplateRef } from 'vue';

const fileInput = useTemplateRef('fileInput');
const fileList = ref<FileList | null>(null);

const isDraggingOver = ref(false);

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target?.files;

  if (files && files.length > 0) {
    fileList.value = files;
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  if (!fileInput.value) return;

  // Collect and parse files/folders from dataTransfer object
  const items = e.dataTransfer?.items;
  if (!items) return;

  const files = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (entry) {
      const result = traverseFileTree(entry);
      files.push(result);
    }
  }

  // Resolve all files and update fileInput
  const resolvedFiles = (await Promise.all(files)).flat();

  const dataTransferWrapper = new DataTransfer();
  resolvedFiles.forEach((file) => dataTransferWrapper.items.add(file));
  fileInput.value.files = dataTransferWrapper.files;

  // Update state
  fileInput.value.dispatchEvent(new Event('change'));
  isDraggingOver.value = false;
};
</script>

<template>
  <div class="h-full w-full flex">
    <!-- <div>
      <div class="w-full p-4 rounded-xl border border-gold bg-white shadow-md">
        <Icon name="tabler:layout-sidebar" class="size-5"></Icon>
        <span class="uppercase font-serif font-semibold text-zinc-700">Grid Properties</span>
      </div>
    </div> -->

    <div class="w-full p-4">
      <div class="mb-4 flex flex-col justify-center">
        <h1 class="font-semibold text-3xl mb-2">Upload Images</h1>
        <p class="font-light">Upload your images below to get started. You can also upload a folder.</p>
      </div>
      <div
        class="relative cursor-pointer group"
        @click="fileInput?.click()"
        @dragover="
          (e) => {
            e.preventDefault();
            isDraggingOver = true;
          }
        "
        @dragenter="(e) => e.preventDefault()"
        @dragleave="isDraggingOver = false"
        @drop="handleDrop"
      >
        <div class="overflow-hidden size-full relative">
          <input type="file" multiple hidden @change="onFileChange" ref="fileInput" />
          <div
            class="absolute border border-dashed rounded-lg duration-150"
            :class="{
              'inset-10 border-rust dark:border-gold': isDraggingOver,
              'inset-4': !isDraggingOver && (!fileList || !fileList.length),
              '-inset-1': fileList && fileList.length,
            }"
          ></div>
          <div
            class="absolute border border-dashed rounded-lg duration-150"
            :class="{ 'inset-5 border-rust dark:border-gold': isDraggingOver, '-inset-1': !isDraggingOver }"
          ></div>
          <div
            class="border border-zinc-200 dark:border-mist-600 rounded-lg h-90 bg-[repeating-linear-gradient(180deg,var(--color-zinc-100)_0,var(--color-zinc-100)_1px,transparent_1px,transparent_100%),repeating-linear-gradient(90deg,var(--color-zinc-100)_0,var(--color-zinc-100)_1px,transparent_1px,transparent_100%)] dark:bg-[repeating-linear-gradient(180deg,var(--color-mist-700)_0,var(--color-mist-700)_1px,transparent_1px,transparent_100%),repeating-linear-gradient(90deg,var(--color-mist-700)_0,var(--color-mist-700)_1px,transparent_1px,transparent_100%)] bg-size-[25px_25px] flex flex-col items-center justify-center duration-150"
            :class="{ 'bg-white dark:bg-mist-800': !isDraggingOver, 'bg-gold/10 dark:bg-gold/10': isDraggingOver }"
          >
            <div
              class="size-24 rounded-full bg-zinc-100 dark:bg-mist-700 border border-zinc-200 dark:border-gold flex items-center justify-center mb-4 group-hover:border-gold duration-150"
            >
              <Upload class="stroke-rust size-10"></Upload>
            </div>
            <h2 class="text-xl font-medium mb-2 tracking-wide">Drop Files and Folders Here</h2>
            <p class="text-zinc-800 dark:text-mist-300 max-w-120 text-center mb-6 tracking-wide font-light">
              Supported formats: JPEG, PNG, WebP, TIFF, and AVIF. Maximum batch size: 500 images.
            </p>
            <button
              class="border rounded-md border-rust dark:border-gold px-4 py-1.5 bg-white dark:bg-mist-700 uppercase font-medium text-rust dark:text-gold duration-150 cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
