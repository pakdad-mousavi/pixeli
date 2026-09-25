<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import Minus from "../icons/Minus.vue";
import Plus from "../icons/Plus.vue";
import { useToggle } from "@vueuse/core";

interface Props {
  min?: number;
  max?: number;
  step?: number;
}

const { min = 0, max = Infinity, step = 1 } = defineProps<Props>();
let defaultValue: number = -1;

const modelValue = defineModel<number>({ required: true });

const input = useTemplateRef("number-input");
const [isValid, toggleValidity] = useToggle(true);

const increment = () => {
  if (modelValue.value + step <= max) {
    modelValue.value += step;
    onInput();
  }
};

const decrement = () => {
  if (modelValue.value - step >= min) {
    modelValue.value -= step;
    onInput();
  }
};

const onInput = () => {
  if (!input.value) return;
  const isInputValid = input.value.checkValidity();
  toggleValidity(isInputValid);
};

// Reset back to default value if input is empty
const onFocusOut = (e: Event) => {
  const target = e.target as HTMLInputElement;

  if (target.value.trim().length <= 0) {
    modelValue.value = defaultValue;
    onInput();
  }
};

// Only allow positive numbers to be pasted
const onPaste = (e: ClipboardEvent) => {
  const rawData = e.clipboardData?.getData("text/plain").trim() ?? "";
  const positiveNumberRegex = /^[0-9]+(\.[0-9]+)?$/;

  if (!positiveNumberRegex.test(rawData)) e.preventDefault();
};

// Capture initial value as the default value
onMounted(() => {
  defaultValue = modelValue.value;
});
</script>

<template>
  <div class="flex gap-4 text-sm px-4 select-none relative dark:text-beige text-center">
    <div
      class="w-full flex bg-gray-100 dark:bg-mist-950 border border-rust/40 dark:border-gold/40 rounded-lg duration-300 relative z-20"
      :class="{ 'border-rose-500!': !isValid }"
    >
      <div
        class="size-8 bg-zinc-200 dark:bg-mist-800 rounded-lg aspect-square my-1 ml-1 flex justify-center items-center cursor-pointer"
        @click="decrement"
      >
        <Minus class="stroke-black dark:stroke-beige size-4"></Minus>
      </div>
      <input
        ref="number-input"
        type="number"
        v-model="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="py-1 outline-none w-full text-center"
        pattern="[0-9]*\.?[0-9]*"
        @focusout="onFocusOut"
        @input="onInput"
        @keypress="(e) => (e.key === '-' ? e.preventDefault() : '')"
        @paste="onPaste"
      />
      <div
        class="size-8 bg-zinc-200 dark:bg-mist-800 rounded-lg aspect-square my-1 mr-1 flex justify-center items-center cursor-pointer"
        @click="increment"
      >
        <Plus class="stroke-black dark:stroke-beige size-4"></Plus>
      </div>
    </div>

    <Transition name="fade">
      <div class="absolute top-full left-4 mt-2 text-rose-500 text-xs line-clamp-1" v-if="!isValid">
        {{ input?.validationMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
