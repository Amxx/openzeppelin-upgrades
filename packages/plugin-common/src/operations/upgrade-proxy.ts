import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Plugin,
  Options,
} from '../types';

import {
  deployImpl,
} from './deploy-impl';

export async function upgradeProxy<E,D,F,I extends { address: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  proxyAddress: string,
  factory: F,
  opts: Required<Options<E,D,F,I>>,
): Promise<I> {
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
  const adminAddress = await getAdminAddress(provider, proxyAddress);
  const adminBytecode = await provider.send('eth_getCode', [adminAddress]);

  if (adminBytecode === '0x') {
    // No admin contract: use TransparentUpgradeableProxyFactory to get proxiable interface
    const proxyFactory = await plugin.getTransparentUpgradeableProxyFactory(env);
    const proxy = plugin.attachContract(proxyFactory, proxyAddress);
    const nextImpl = await deployImpl(plugin, env, factory, opts, { proxyAddress, manifest });
    await (proxy as any).upgradeTo(nextImpl);
  } else {
    // Admin contract: redirect upgrade call through it
    const adminFactory  = await plugin.getProxyAdminFactory(env);
    const admin         = plugin.attachContract(adminFactory, adminAddress);
    const manifestAdmin = await manifest.getAdmin();
    if (admin.address !== manifestAdmin?.address) {
      throw new Error('Proxy admin is not the one registered in the network manifest');
    }
    const nextImpl = await deployImpl(plugin, env, factory, opts, { proxyAddress, manifest });
    await (admin as any).upgrade(proxyAddress, nextImpl);
  }

  return plugin.attachContract(factory, proxyAddress);
}
