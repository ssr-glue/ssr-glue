import { IncomingMessage } from 'http'
import { BasePluginContainer, ServerSidePlugin, ServerSidePluginHookContext } from 'ssr-glue'

export class ServerSidePluginContainer extends BasePluginContainer<
  ServerSidePlugin,
  ServerSidePluginHookContext
> {
  /**
   * Trigger all the registered `transformHtml` hooks of plugins.
   *
   * @param html The basic HTML
   */
  async triggerTransformHtml(html: string): Promise<string> {
    for (const plugin of this.plugins) {
      if (!plugin.transformHtml) {
        continue
      }

      html = await plugin.transformHtml.bind(this.pluginHookContext)(html)
    }

    return html
  }

  /**
   * Trigger all the registered `onRequest` hooks of plugins.
   *
   * @param request The incoming request.
   */
  async triggerRequest(request: IncomingMessage): Promise<void> {
    for (const plugin of this.plugins) {
      if (!plugin.request) {
        continue
      }

      await plugin.request.bind(this.pluginHookContext)(request)
    }
  }
}
