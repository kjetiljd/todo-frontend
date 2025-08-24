import axios from 'axios'
import type { Todo, CreateTodoRequest, UpdateTodoRequest, SortBy } from '@/types/todo'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const todoApi = {
  // Get all todos (sorted by default)
  async getTodos(sortBy?: SortBy): Promise<Todo[]> {
    const params = sortBy ? { sortBy } : {}
    const response = await api.get<Todo[]>('/todos', { params })
    return response.data
  },

  // Create a new todo
  async createTodo(todo: CreateTodoRequest): Promise<Todo> {
    const response = await api.post<Todo>('/todos', todo)
    return response.data
  },

  // Update an existing todo
  async updateTodo(id: number, updates: UpdateTodoRequest): Promise<Todo> {
    const response = await api.put<Todo>(`/todos/${id}`, updates)
    return response.data
  },

  // Delete a todo
  async deleteTodo(id: number): Promise<void> {
    await api.delete(`/todos/${id}`)
  },

  // Toggle completion status
  async toggleTodo(id: number): Promise<Todo> {
    const response = await api.patch<Todo>(`/todos/${id}/toggle`)
    return response.data
  }
}