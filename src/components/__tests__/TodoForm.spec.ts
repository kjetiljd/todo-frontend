import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import TodoForm from '../TodoForm.vue'
import type { Todo } from '@/types/todo'

describe('TodoForm', () => {
  const mockTodo: Todo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  describe('Create mode', () => {
    it('renders form in create mode by default', () => {
      const wrapper = mount(TodoForm)
      
      expect(wrapper.find('h2').text()).toBe('Add New Todo')
      expect(wrapper.find('button[type="submit"]').text()).toBe('Add Todo')
      expect(wrapper.find('button[type="button"]').exists()).toBe(false)
    })

    it('has empty form fields initially', () => {
      const wrapper = mount(TodoForm)
      
      expect(wrapper.find('#title').element.value).toBe('')
      expect(wrapper.find('#description').element.value).toBe('')
      expect(wrapper.find('#priority').element.value).toBe('medium')
      expect(wrapper.find('#dueDate').element.value).toBe('')
    })

    it('emits submit event with form data when submitted', async () => {
      const wrapper = mount(TodoForm)
      
      await wrapper.find('#title').setValue('New Todo')
      await wrapper.find('#description').setValue('New description')
      await wrapper.find('#priority').setValue('high')
      await wrapper.find('#dueDate').setValue('2024-01-15')
      
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        title: 'New Todo',
        description: 'New description',
        priority: 'high',
        dueDate: '2024-01-15'
      }])
    })

    it('removes empty optional fields from submission data', async () => {
      const wrapper = mount(TodoForm)
      
      await wrapper.find('#title').setValue('New Todo')
      await wrapper.find('#priority').setValue('low')
      
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.emitted('submit')[0]).toEqual([{
        title: 'New Todo',
        priority: 'low'
      }])
    })

    it('resets form after successful submission in create mode', async () => {
      const wrapper = mount(TodoForm)
      
      await wrapper.find('#title').setValue('New Todo')
      await wrapper.find('#description').setValue('Description')
      
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('#title').element.value).toBe('')
      expect(wrapper.find('#description').element.value).toBe('')
      expect(wrapper.find('#priority').element.value).toBe('medium')
      expect(wrapper.find('#dueDate').element.value).toBe('')
    })
  })

  describe('Edit mode', () => {
    it('renders form in edit mode when editingTodo prop is provided', () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      expect(wrapper.find('h2').text()).toBe('Edit Todo')
      expect(wrapper.find('button[type="submit"]').text()).toBe('Update Todo')
      expect(wrapper.find('button[type="button"]').exists()).toBe(true)
      expect(wrapper.find('button[type="button"]').text()).toBe('Cancel')
    })

    it('populates form fields with editing todo data', () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      expect(wrapper.find('#title').element.value).toBe('Test Todo')
      expect(wrapper.find('#description').element.value).toBe('Test description')
      expect(wrapper.find('#priority').element.value).toBe('high')
      expect(wrapper.find('#dueDate').element.value).toBe('2024-01-15')
    })

    it('handles editing todo with missing optional fields', () => {
      const todoWithoutOptionals: Todo = {
        ...mockTodo,
        description: undefined,
        dueDate: undefined
      }
      
      const wrapper = mount(TodoForm, {
        props: { editingTodo: todoWithoutOptionals }
      })
      
      expect(wrapper.find('#description').element.value).toBe('')
      expect(wrapper.find('#dueDate').element.value).toBe('')
    })

    it('emits submit event with updated data in edit mode', async () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      await wrapper.find('#title').setValue('Updated Todo')
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        title: 'Updated Todo',
        description: 'Test description',
        priority: 'high',
        dueDate: '2024-01-15'
      }])
    })

    it('emits cancel event when cancel button is clicked', async () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      await wrapper.find('button[type="button"]').trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('does not reset form after submission in edit mode', async () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      await wrapper.find('#title').setValue('Updated Todo')
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('#title').element.value).toBe('Updated Todo')
    })
  })

  describe('Reactivity', () => {
    it('updates form when editingTodo prop changes', async () => {
      const wrapper = mount(TodoForm)
      
      expect(wrapper.find('#title').element.value).toBe('')
      
      await wrapper.setProps({ editingTodo: mockTodo })
      
      expect(wrapper.find('#title').element.value).toBe('Test Todo')
      expect(wrapper.find('#description').element.value).toBe('Test description')
    })

    it('resets form when editingTodo prop changes to null', async () => {
      const wrapper = mount(TodoForm, {
        props: { editingTodo: mockTodo }
      })
      
      expect(wrapper.find('#title').element.value).toBe('Test Todo')
      
      await wrapper.setProps({ editingTodo: null })
      
      expect(wrapper.find('#title').element.value).toBe('')
      expect(wrapper.find('#description').element.value).toBe('')
      expect(wrapper.find('#priority').element.value).toBe('medium')
    })
  })

  describe('Form validation', () => {
    it('has required attribute on title field', () => {
      const wrapper = mount(TodoForm)
      
      expect(wrapper.find('#title').attributes('required')).toBeDefined()
    })

    it('title field is invalid when empty', () => {
      const wrapper = mount(TodoForm)
      const titleInput = wrapper.find('#title').element as HTMLInputElement
      
      expect(titleInput.checkValidity()).toBe(false)
      expect(titleInput.validity.valueMissing).toBe(true)
    })

    it('title field is valid when filled', async () => {
      const wrapper = mount(TodoForm)
      const titleInput = wrapper.find('#title')
      
      await titleInput.setValue('Valid title')
      
      expect((titleInput.element as HTMLInputElement).checkValidity()).toBe(true)
    })
  })
})