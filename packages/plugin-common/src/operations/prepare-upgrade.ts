import { Manifest } from '@openzeppelin/upgrades-core';

import {
  Plugin,
  Options,
} from '../types';

import {
  deployImpl,
} from './deploy-impl';

export async function prepareUpgrade<E,D,F,I extends { address: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  proxyAddress: string,
  factory: F,
  opts: Required<Options<E,D,F,I>>,
): Promise<string> {
  const provider = plugin.getProvider(env);
  const manifest = await Manifest.forNetwork(provider);

  // Autodetect proxy type
  if (opts.kind === 'auto') {
    try {
      const { kind } = await manifest.getProxyFromAddress(proxyAddress);
      opts.kind = kind;
    } catch (e) {
      if (e instanceof Error) {
        opts.kind = 'transparent';
      } else {
        throw e;
      }
    }
  }

  return await deployImpl(plugin, env, factory, opts, { proxyAddress, manifest });
}
