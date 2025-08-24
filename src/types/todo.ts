export interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTodoRequest {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
}

export interface UpdateTodoRequest {
  title?: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
}

export type SortBy = 'priority' | 'dueDate' | 'createdAt' | 'alphabetical' | 'completion'