import {
  ContractFactory,
  ContractInstance,
  DeployProxyFunction,
  Options,
  withDefaults,
} from './types/index';

import { fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  attach,
  deploy,
  deployImpl,
  getProxyFactory,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
  wrapProvider,
} from './utils';

export const deployProxy: DeployProxyFunction = async function(
  factory: ContractFactory,
  args: unknown[] | Options = [],
  opts: Options = {},
): Promise<ContractInstance> {
  if (!Array.isArray(args)) {
    opts = args;
    args = [];
  }
  const requiredOpts: Required<Options> = withDefaults(opts);

  const provider = wrapProvider(requiredOpts.deployer.provider);
  const impl = await deployImpl(factory, requiredOpts);
  const data = getInitializerData(factory, args, requiredOpts.initializer);

  let proxy: ContractInstance;
  switch (requiredOpts.kind) {
    case 'auto':
    case 'uups': {
      const ProxyFactory = getProxyFactory(factory);
      proxy = await requiredOpts.deployer.deploy(ProxyFactory, impl, data);
      break;
    }

    case 'transparent': {
      const AdminFactory = getProxyAdminFactory(factory);
      const adminAddress = await fetchOrDeployAdmin(provider, () => deploy(AdminFactory, requiredOpts.deployer));
      const TransparentUpgradeableProxyFactory = getTransparentUpgradeableProxyFactory(factory);
      proxy = await requiredOpts.deployer.deploy(TransparentUpgradeableProxyFactory, impl, adminAddress, data);
      break;
    }
  }

  factory.address = proxy.address;
  const instance = attach(factory, proxy.address);
  instance.transactionHash = proxy.transactionHash;
  return instance;
}

function getInitializerData(factory: ContractFactory, args: unknown[], initializer: string | false): string {
  if (initializer === false) {
    return '0x';
  }

  const stub = new factory('');
  if (initializer in stub.contract.methods) {
    return stub.contract.methods[initializer](...args).encodeABI();
  } else if (initializer === 'initialize' && args.length === 0) {
    return '0x';
  } else {
    throw new Error(`Contract ${factory.name} does not have a function \`${initializer}\``);
  }
}
