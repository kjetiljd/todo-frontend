<template>
  <form @submit.prevent="handleSubmit" class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h2 class="text-lg font-semibold mb-4">
      {{ isEditing ? 'Edit Todo' : 'Add New Todo' }}
    </h2>
    
    <div class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter todo title"
        />
      </div>
      
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter description (optional)"
        />
      </div>
      
      <div class="flex space-x-4">
        <div class="flex-1">
          <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            v-model="form.priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div class="flex-1">
          <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
    
    <div class="flex justify-end space-x-3 mt-6">
      <button
        v-if="isEditing"
        type="button"
        @click="handleCancel"
        class="btn-ghost"
      >
        Cancel
      </button>
      
      <button
        type="submit"
        class="btn-primary"
      >
        {{ isEditing ? 'Update' : 'Add' }} Todo
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'

interface Props {
  editingTodo?: Todo | null
}

interface Emits {
  submit: [data: CreateTodoRequest | UpdateTodoRequest]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<CreateTodoRequest>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: ''
})

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  }
}

const isEditing = computed(() => !!props.editingTodo)

// Watch for changes in editingTodo prop
watch(() => props.editingTodo, (todo) => {
  if (todo) {
    form.value = {
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  const data = { ...form.value }
  if (!data.description) delete data.description
  if (!data.dueDate) delete data.dueDate
  
  emit('submit', data)
  
  if (!isEditing.value) {
    resetForm()
  }
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
}
</script>