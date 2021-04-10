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
   * The hook is called after the plugin be created.
   */
  created?(this: ServerSidePluginHookContext): void

  /**
   * The hook is called after the `created` hook.
   * Bootstrapping works should be executed at here.
   *
   * previous hook: `created`
   */
  boot?(this: ServerSidePluginHookContext): void | Promise<void>

  /**
   * The hook is called on every incoming request.
   *
   * previous hook: `boot`
   * @param request
   */
  request?(this: ServerSidePluginHookContext, request: IncomingMessage): void | Promise<void>

  /**
   * The hook is used to transform the outgoing HTML.
   *
   * previous hook: `request`
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
  created?(this: ClientSidePluginHookContext): void

  /**
   * The hook is called after the `created` hook.
   * Bootstrapping works should be executed at here.
   *
   * previous hook: `created`
   */
  boot?(this: ClientSidePluginHookContext): void | Promise<void>
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
   * Trigger the all registered `created` hooks of plugins.
   * This method should be called after all plugins be created.
   */
  triggerCreated() {
    for (const plugin of this.plugins) {
      if (!plugin.created) {
        continue
      }

      plugin.created.bind(this.pluginHookContext)()
    }
  }

  /**
   * Trigger the all registered `boot` hooks of plugins.
   * This method should be called after all plugins be created.
   */
  async triggerBoot(): Promise<void> {
    const promises = this.plugins
      .filter((plugin) => plugin.boot)
      .map((plugin) => {
        const result = plugin!.boot!.bind(this.pluginHookContext)()
        return result instanceof Promise ? result : Promise.resolve()
      })

    await Promise.all(promises)
  }
}
