import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

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
  const adminAddress = await getAdminAddress(provider, proxyAddress);
  if (opts.kind === 'auto') {
    opts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
  }

  return await deployImpl(plugin, env, factory, opts); // TODO: check { proxyAddress, manifest }
}
