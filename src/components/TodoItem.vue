<template>
  <div class="todo-item border rounded-lg p-4 mb-3 bg-white shadow-sm">
    <div class="flex items-start justify-between">
      <div class="flex items-center space-x-3 flex-1">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="$emit('toggle', todo.id)"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        <div class="flex-1">
          <h3 
            :class="['font-medium', todo.completed ? 'line-through text-gray-500' : 'text-gray-900']"
          >
            {{ todo.title }}
          </h3>
          
          <p 
            v-if="todo.description" 
            :class="['text-sm mt-1', todo.completed ? 'text-gray-400' : 'text-gray-600']"
          >
            {{ todo.description }}
          </p>
          
          <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span class="priority" :class="priorityClass">
              {{ todo.priority.toUpperCase() }}
            </span>
            
            <span v-if="todo.dueDate">
              Due: {{ formatDate(todo.dueDate) }}
            </span>
            
            <span>
              Created: {{ formatDate(todo.createdAt) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button
          @click="$emit('edit', todo)"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          Edit
        </button>
        
        <button
          @click="$emit('delete', todo.id)"
          class="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '@/types/todo'

interface Props {
  todo: Todo
}

interface Emits {
  toggle: [id: number]
  edit: [todo: Todo]
  delete: [id: number]
}

const props = defineProps<Props>()
defineEmits<Emits>()

const priorityClass = computed(() => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
  switch (props.todo.priority) {
    case 'high':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'medium':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'low':
      return `${baseClasses} bg-green-100 text-green-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>