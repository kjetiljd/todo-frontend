import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Simple in-memory mock API for dev usage
function mockApiPlugin(): Plugin {
  let nextId = 3
  const todos = [
    {
      id: 1,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      completed: false,
      priority: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: 2,
      title: 'Read a book',
      description: 'Finish chapter 5',
      completed: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ] as any[]

  const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 }

  function sortTodos(list: any[], sortBy?: string) {
    switch (sortBy) {
      case 'priority':
        return [...list].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      case 'dueDate':
        return [...list].sort((a, b) => (a.dueDate ?? '') < (b.dueDate ?? '') ? -1 : 1)
      case 'alphabetical':
        return [...list].sort((a, b) => a.title.localeCompare(b.title))
      case 'completion':
        return [...list].sort((a, b) => Number(a.completed) - Number(b.completed))
      case 'createdAt':
      default:
        return [...list].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    }
  }

  function sendJson(res: any, data: any, status = 200) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }

  async function readBody(req: any) {
    const chunks: any[] = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf-8')
    if (!raw) return {}
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://local')
        const path = url.pathname

        if (req.method === 'GET' && path === '/todos') {
          const sortBy = url.searchParams.get('sortBy') || undefined
          return sendJson(res, sortTodos(todos, sortBy))
        }

        if (req.method === 'POST' && path === '/todos') {
          const body = await readBody(req)
          if (body === null) return sendJson(res, { message: 'Invalid JSON' }, 400)
          const now = new Date().toISOString()
          const todo = {
            id: nextId++,
            title: body.title,
            description: body.description ?? '',
            completed: false,
            priority: body.priority || 'low',
            dueDate: body.dueDate,
            createdAt: now,
            updatedAt: now
          }
          todos.push(todo)
          return sendJson(res, todo, 201)
        }

        const toggleMatch = path.match(/^\/todos\/(\d+)\/toggle$/)
        if (req.method === 'PATCH' && toggleMatch) {
          const id = Number(toggleMatch[1])
          const todo = todos.find(t => t.id === id)
          if (!todo) return sendJson(res, { message: 'Not found' }, 404)
          todo.completed = !todo.completed
          todo.updatedAt = new Date().toISOString()
          return sendJson(res, todo)
        }

        const idMatch = path.match(/^\/todos\/(\d+)$/)
        if (idMatch) {
          const id = Number(idMatch[1])
          const idx = todos.findIndex(t => t.id === id)
          if (req.method === 'PUT') {
            const body = await readBody(req)
            if (body === null) return sendJson(res, { message: 'Invalid JSON' }, 400)
            if (idx === -1) return sendJson(res, { message: 'Not found' }, 404)
            const todo = todos[idx]
            Object.assign(todo, body)
            todo.updatedAt = new Date().toISOString()
            return sendJson(res, todo)
          }
          if (req.method === 'DELETE') {
            if (idx === -1) return sendJson(res, { message: 'Not found' }, 404)
            todos.splice(idx, 1)
            res.statusCode = 204
            return res.end()
          }
        }

        return next()
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK_API === 'true'
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8080'

  return {
    plugins: ([
      vue(),
      useMock ? mockApiPlugin() : null
    ].filter(Boolean) as PluginOption[]),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 3000,
      ...(useMock
        ? {}
        : {
            proxy: {
              '/api': {
                target: apiTarget,
                changeOrigin: true
              }
            }
          })
    }
  }
})