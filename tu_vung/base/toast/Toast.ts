import { createVNode, render } from 'vue'
import ToastComponent from './ToastComponent.vue'
import type { ToastOptions, ToastInstance, ToastService } from './type.ts'

interface ToastContainer {
  id: string
  container: HTMLElement
  instance: ToastInstance
  offset: number
}

let toastContainers: ToastContainer[] = []
let toastIdCounter = 0


const createToastContainer = (): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'toast-container'
  container.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    pointer-events: none;
  `
  return container
}


const updateToastPositions = () => {
  toastContainers.forEach((toastContainer, index) => {
    const offset = index * 70
    toastContainer.offset = offset
    toastContainer.container.style.marginTop = `${offset}px`
  })
}


const removeToastContainer = (id: string) => {
  const index = toastContainers.findIndex(container => container.id === id)
  if (index > -1) {
    const container = toastContainers[index]

    setTimeout(() => {
      render(null, container!.container)
      container!.container.remove()
      const currentIndex = toastContainers.findIndex(c => c.id === id)
      if (currentIndex > -1) {
        toastContainers.splice(currentIndex, 1)
        updateToastPositions()
      }
    }, 300)
  }
}

const Toast: ToastService = (options: ToastOptions | string): ToastInstance => {
  const toastOptions = typeof options === 'string' ? { message: options } : options
  const id = `toast-${++toastIdCounter}`


  const container = createToastContainer()
  document.body.appendChild(container)


  const vnode = createVNode(ToastComponent, {
    ...toastOptions,
    onClose: () => {
      removeToastContainer(id)
    },
  })


  render(vnode, container)


  const instance: ToastInstance = {
    close: () => {
      vnode.component?.exposed?.close?.()
    },
  }


  const toastContainer: ToastContainer = {
    id,
    container,
    instance,
    offset: 0,
  }

  toastContainers.push(toastContainer)
  updateToastPositions()

  return instance
}


Toast.success = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
  return Toast({ message, type: 'success', ...options })
}

Toast.warning = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
  return Toast({ message, type: 'warning', ...options })
}

Toast.info = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
  return Toast({ message, type: 'info', ...options })
}

Toast.error = (message: string, options?: Omit<ToastOptions, 'message' | 'type'>) => {
  return Toast({ message, type: 'error', ...options })
}


Toast.closeAll = () => {
  toastContainers.forEach(container => container.instance.close())
  toastContainers = []
}

export default Toast