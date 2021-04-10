import { ServerSidePlugin } from 'ssr-glue'

declare module 'ssr-glue' {
  interface ServerSideEventMap {
    barPluginCreated: (event: { foo: string }) => boolean
  }
}

export function mockPlugins() {
  const createdHandler = jest.fn()
  const requestHandler = jest.fn()
  const bootHandler = jest.fn()
  const barPluginCreatedHandler = jest.fn()

  function fooPlugin(): ServerSidePlugin {
    return {
      name: 'server:foo',

      created() {
        this.eventBus.on('barPluginCreated', (event) => {
          barPluginCreatedHandler(event)
          return true
        })

        createdHandler('onCreated')
      },

      boot() {
        bootHandler('booting')
      },

      request(request) {
        requestHandler(request)
      },

      async transformHtml(html: string) {
        return html.replace('foo', 'new foo')
      },
    }
  }

  function barPlugin(): ServerSidePlugin {
    return {
      name: 'server:foo',

      created() {
        createdHandler('onCreated')

        this.eventBus.trigger('barPluginCreated', { foo: 'bar' })
      },

      transformHtml(html: string) {
        return html.replace('bar', 'new bar')
      },
    }
  }

  return {
    barPluginCreatedHandler,
    createdHandler,
    requestHandler,
    bootHandler,
    fooPlugin,
    barPlugin,
  }
}
