import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Plugin,
} from '../types';

export async function getInstance<E,D,F,I>(
  plugin: Plugin<E,D,F,I>,
  env: E,
): Promise<I> {
  const provider = plugin.getProvider(env);
  const manifest = await Manifest.forNetwork(provider);
  const manifestAdmin = await manifest.getAdmin();
  const proxyAdminAddress = manifestAdmin?.address;

  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest');
  }

  return plugin.attachContract(await plugin.getProxyAdminFactory(env), proxyAdminAddress);
}

export async function changeProxyAdmin<E,D,F,I extends { address: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  proxyAddress: string,
  newAdmin: string,
): Promise<void> {
  const provider = plugin.getProvider(env);
  const proxyAdminAddress = await getAdminAddress(provider, proxyAddress);

  const admin = await getInstance(plugin, env);
  if (admin.address !== proxyAdminAddress) {
    throw new Error('Proxy admin is not the one registered in the network manifest');
  } else if (admin.address !== newAdmin) {
    await (admin as any).changeProxyAdmin(proxyAddress, newAdmin);
  }
}

export async function transferProxyAdminOwnership<E,D,F,I>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  newOwner: string,
): Promise<void> {
  const admin = await getInstance(plugin, env);
  await (admin as any).transferOwnership(newOwner);
}
