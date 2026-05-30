<script setup lang="ts">
import { inject, computed, watch } from 'vue';

const props = defineProps<{
  label: string;
  value: any;
  disabled?: boolean;
}>();


const selectValue = inject('selectValue', null);
const selectHandler = inject('selectHandler', null);


const isSelected = computed(() => {
  return selectValue.value === props.value;
});


const handleClick = () => {
  if (props.disabled) return;
  if (selectHandler) {
    selectHandler(props.value, props.label);
  }
};


watch(() => props.value, () => {}, { immediate: true });
</script>

<template>
  <li
    class="option"
    :class="{
      'is-selected': isSelected,
      'is-disabled': disabled
    }"
    @click="handleClick"
  >
    <slot>
      <span class="option__label">{{ label }}</span>
    </slot>
  </li>
</template>

<style scoped lang="scss">
.option {
  @apply flex items-center px-2 py-1 cursor-pointer transition-all duration-300;

  &:hover {
    background-color: var(--color-fourth);
  }

  &.is-selected {
    color: var(--color-select-bg);
    font-weight: bold;
    background-color: var(--color-fifth);
  }

  &.is-disabled {
    color: #c0c4cc;
    cursor: not-allowed;
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>