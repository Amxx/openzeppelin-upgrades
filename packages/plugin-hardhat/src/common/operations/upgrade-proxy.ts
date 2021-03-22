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
  const adminAddress = await getAdminAddress(provider, proxyAddress);
  if (opts.kind === 'auto') {
    opts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
  }

  switch (opts.kind) {
    case 'uups': {
      const proxyFactory = await plugin.getTransparentUpgradeableProxyFactory(env);
      const proxy = plugin.attachContract(proxyFactory, proxyAddress);
      const nextImpl = await deployImpl(plugin, env, factory, opts); // TODO: check { proxyAddress, manifest }
      await (proxy as any).upgradeTo(nextImpl);
      break;
    }

    case 'transparent': {
      const adminFactory  = await plugin.getProxyAdminFactory(env);
      const admin         = plugin.attachContract(adminFactory, adminAddress);
      const manifestAdmin = await manifest.getAdmin();
      if (admin.address !== manifestAdmin?.address) {
        throw new Error('Proxy admin is not the one registered in the network manifest');
      }
      const nextImpl = await deployImpl(plugin, env, factory, opts); // TODO: check { proxyAddress, manifest }
      await (admin as any).upgrade(proxyAddress, nextImpl);
      break;
    }
  }

  return plugin.attachContract(factory, proxyAddress);
}
