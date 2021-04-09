import { IncomingMessage } from 'http'
import { EventDispatcher } from 'EventDispatcher'
import { ServerSideEventMap, ClientSideEventMap } from './eventMap'

/**
 * The universal event-bus object for Inter-plugin communication.
 */

export type ServerSidePluginHookContext = {
  eventBus: EventDispatcher<ServerSideEventMap>
}

export type ClientSidePluginHookContext = {
  eventBus: EventDispatcher<ClientSideEventMap>
}

export type BasePlugin = {
  /**
   * The plugin name, should follow the shape of `{plugin-type}:{plugin-id}`
   */
  name: string
}

/**
 * Plugin interface for server-side
 */
export type ServerSidePlugin = BasePlugin & {
  /**
   * The hook be called after the plugin be created.
   */
  onCreated?(this: ServerSidePluginHookContext): void

  /**
   * The hook be called on every incoming request.
   *
   * previous hook: `onCreated`
   * @param request
   */
  onRequest?(this: ServerSidePluginHookContext, request: IncomingMessage): void | Promise<void>

  /**
   * The hook be used to transform the outgoing HTML.
   *
   * previous hook: `onRequest`
   * @param html
   */
  transformHtml?(this: ServerSidePluginHookContext, html: string): string | Promise<string>
}

/**
 * Plugin interface for client side
 */
export type ClientSidePlugin = BasePlugin & {
  /**
   * The hook be called after the plugin be created.
   */
  onCreated?(this: ClientSidePluginHookContext): void
}

/**
 * The base plugin container class
 */
export abstract class BasePluginContainer<
  Plugin extends ServerSidePlugin | ClientSidePlugin,
  PluginHookContext extends ServerSidePluginHookContext | ClientSidePluginHookContext
> {
  plugins: Plugin[]
  pluginHookContext: PluginHookContext

  constructor(plugins: Plugin[], pluginHookContext: PluginHookContext) {
    this.plugins = plugins
    this.pluginHookContext = pluginHookContext
  }

  /**
   * Trigger the all registered `onCreated` hooks of plugins.
   * This method should be called after all plugins be created.
   */
  triggerOnCreated() {
    for (const plugin of this.plugins) {
      if (!plugin.onCreated) {
        continue
      }

      plugin.onCreated.bind(this.pluginHookContext)()
    }
  }
}
