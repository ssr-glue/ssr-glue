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
  created?(this: ServerSidePluginHookContext): void | Promise<void>

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
  created?(this: ClientSidePluginHookContext): void | Promise<void>

  /**
   * The hook is called after the `created` hook.
   * Bootstrapping works should be executed at here.
   *
   * previous hook: `created`
   */
  boot?(this: ClientSidePluginHookContext): void | Promise<void>
}

type HookName = 'created' | 'boot' | 'request' | 'transformHtml'

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
  async triggerCreated(): Promise<void> {
    return this.triggerHook('created')
  }

  /**
   * Trigger the all registered `boot` hooks of plugins.
   * This method should be called after all plugins be created.
   */
  async triggerBoot(): Promise<void> {
    return this.triggerHook('boot')
  }

  /**
   * Trigger any hook of plugins.
   */
  async triggerHook<Strategy extends 'parallel' | 'series' = 'parallel'>(
    hookName: HookName,
    options?: { strategy?: Strategy; arguments?: any[] }
  ): Promise<void> {
    const plugins = this.plugins.filter((plugin) => hookName in plugin)

    if (plugins.length === 0) {
      return
    }

    const args = options?.arguments || []
    const strategy = options?.strategy

    if (strategy === 'series') {
      for (const plugin of plugins) {
        await (plugin as any)[hookName].apply(this.pluginHookContext, args)
      }

      return
    }

    // strategy: parallel
    const promises = plugins.map((plugin) => {
      const result = (plugin as any)[hookName].apply(this.pluginHookContext, args)
      return result instanceof Promise ? result : Promise.resolve()
    })

    await Promise.all(promises)
  }
}
