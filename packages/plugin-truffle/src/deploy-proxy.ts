import chalk from 'chalk';
import { Manifest, fetchOrDeployProxy, fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  attach,
  deploy,
  deployImpl,
  getProxyFactory,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
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
  const env: Environment = requiredOpts;

  const provider = wrapProvider(requiredOpts.deployer.provider);
  const manifest = await Manifest.forNetwork(provider);
  const impl = await deployImpl(Contract, requiredOpts);
  const data = getInitializerData(Contract, args, requiredOpts.initializer);

  if (requiredOpts.kind === 'uups' && (await manifest.getAdmin())) {
    console.log(
      chalk.keyword('orange')(
        `Warning: the manifest include records of an proxy admin. This is not nativelly compatible with UUPS proxies. Any further admin action will have no affect on this new proxy.`,
      ),
    );
  }

  let proxyAddress: string;
  switch (requiredOpts.kind) {
    case 'uups': {
      const ProxyFactory = getProxyFactory(Contract);
      proxyAddress = await fetchOrDeployProxy(provider, 'uups', () =>
        deploy(requiredOpts.deployer, ProxyFactory, impl, data),
      );
      break;
    }

    case 'auto':
    case 'transparent': {
      const AdminFactory = getProxyAdminFactory(Contract);
      const adminAddress = await fetchOrDeployAdmin(provider, () => deploy(requiredOpts.deployer, AdminFactory));
      const TransparentUpgradeableProxyFactory = getTransparentUpgradeableProxyFactory(Contract);
      proxyAddress = await fetchOrDeployProxy(provider, 'transparent', () =>
        deploy(requiredOpts.deployer, TransparentUpgradeableProxyFactory, impl, adminAddress, data),
      );
      break;
    }
  }

  const { txHash } = await manifest.getProxyFromAddress(proxyAddress);

  Contract.address = proxyAddress;
  const contract = new Contract(proxyAddress);
  contract.transactionHash = txHash;
  return contract;
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
