<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        Todo List
      </h1>
      
      <!-- Todo Form -->
      <TodoForm
        :editing-todo="editingTodo"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      
      <!-- Filters and Sorting -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Filter:</label>
            <select
              v-model="filter"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              v-model="sortBy"
              @change="loadTodos"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="completion">Completion Status</option>
            </select>
          </div>
        </div>
        
        <div class="mt-3 text-sm text-gray-600">
          {{ filteredTodos.length }} {{ filteredTodos.length === 1 ? 'todo' : 'todos' }}
          {{ filter !== 'all' ? `(${filter})` : '' }}
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-500">Loading todos...</div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="text-red-800">{{ error }}</div>
        <button
          @click="loadTodos"
          class="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Try again
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="filteredTodos.length === 0" class="text-center py-12">
        <div class="text-gray-500 text-lg">
          {{ todos.length === 0 ? 'No todos yet!' : `No ${filter} todos` }}
        </div>
        <div class="text-gray-400 mt-2">
          {{ todos.length === 0 ? 'Add your first todo above' : `Try changing the filter` }}
        </div>
      </div>
      
      <!-- Todo Items -->
      <div v-else class="space-y-3">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="handleToggle"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { todoApi } from '@/api/todoApi'
import TodoForm from './TodoForm.vue'
import TodoItem from './TodoItem.vue'
import type { Todo, CreateTodoRequest, UpdateTodoRequest, SortBy } from '@/types/todo'

// Reactive state
const todos = ref<Todo[]>([])
const editingTodo = ref<Todo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const filter = ref<'all' | 'active' | 'completed'>('all')
const sortBy = ref<SortBy>('createdAt')

// Computed properties
const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    switch (filter.value) {
      case 'active':
        return !todo.completed
      case 'completed':
        return todo.completed
      default:
        return true
    }
  })
})

// Methods
const loadTodos = async () => {
  loading.value = true
  error.value = null
  
  try {
    todos.value = await todoApi.getTodos(sortBy.value)
  } catch (err) {
    error.value = 'Failed to load todos. Please try again.'
    console.error('Failed to load todos:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (data: CreateTodoRequest | UpdateTodoRequest) => {
  try {
    if (editingTodo.value) {
      // Update existing todo
      await todoApi.updateTodo(editingTodo.value.id, data as UpdateTodoRequest)
      editingTodo.value = null
    } else {
      // Create new todo
      await todoApi.createTodo(data as CreateTodoRequest)
    }
    
    await loadTodos()
  } catch (err) {
    error.value = 'Failed to save todo. Please try again.'
    console.error('Failed to save todo:', err)
  }
}

const handleCancel = () => {
  editingTodo.value = null
}

const handleToggle = async (id: number) => {
  try {
    await todoApi.toggleTodo(id)
    await loadTodos()
  } catch (err) {
    error.value = 'Failed to update todo. Please try again.'
    console.error('Failed to toggle todo:', err)
  }
}

const handleEdit = (todo: Todo) => {
  editingTodo.value = todo
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this todo?')) {
    return
  }
  
  try {
    await todoApi.deleteTodo(id)
    await loadTodos()
  } catch (err) {
    error.value = 'Failed to delete todo. Please try again.'
    console.error('Failed to delete todo:', err)
  }
}

// Load todos on component mount
onMounted(() => {
  loadTodos()
})
</script>