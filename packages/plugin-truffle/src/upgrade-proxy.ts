import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractFactory,
  ContractInstance,
  UpgradeProxyFunction,
  Options,
  withDefaults,
  attach,
  deployImpl,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
} from './utils';

export const upgradeProxy: UpgradeProxyFunction = async function(
  proxyAddress: string,
  factory: ContractFactory,
  opts: Options = {},
): Promise<ContractInstance> {
  const requiredOpts: Required<Options> = withDefaults(opts);
  const env: Environment = requiredOpts;

  const { provider } = env.network;
  const manifest = await Manifest.forNetwork(provider);

  // Autodetect proxy type
  const adminAddress = await getAdminAddress(provider, proxyAddress);
  if (requiredOpts.kind === 'auto') {
    requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
  }

  switch (requiredOpts.kind) {
    case 'uups': {
      // Use TransparentUpgradeableProxyFactory to get proxiable interface
      const TransparentUpgradeableProxyFactory = await getTransparentUpgradeableProxyFactory(env); // TODO: pass factory.currentProvider
      const proxy = attach(TransparentUpgradeableProxyFactory, proxyAddress);
      const nextImpl = await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
      await proxy.upgradeTo(nextImpl);
      break;
    }

    case 'transparent': {
      const AdminFactory = await getProxyAdminFactory(env); // TODO: pass factory.currentProvider
      const admin = attach(AdminFactory, adminAddress);
      const manifestAdmin = await manifest.getAdmin();
      if (admin.address !== manifestAdmin?.address) {
        throw new Error('Proxy admin is not the one registered in the network manifest');
      }

      const nextImpl = await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
      await admin.upgrade(proxyAddress, nextImpl);
      break;
    }
  }

  factory.address = proxyAddress;
  return attach(factory, proxyAddress);
}
