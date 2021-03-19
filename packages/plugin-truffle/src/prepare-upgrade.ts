import { Manifest } from '@openzeppelin/upgrades-core';

import {
  ContractFactory,
  PrepareUpgradeFunction,
  Options,
  withDefaults,
} from './types/index';

import { deployImpl, wrapProvider } from './utils';

export const prepareUpgrade: PrepareUpgradeFunction = async function (
  proxyAddress: string,
  factory: ContractFactory,
  opts: Options = {},
): Promise<string> {
  const requiredOpts: Required<Options> = withDefaults(opts);

  const provider = wrapProvider(requiredOpts.deployer.provider);
  const manifest = await Manifest.forNetwork(provider);

  if (requiredOpts.kind === 'auto') {
    try {
      const { kind } = await manifest.getProxyFromAddress(proxyAddress);
      requiredOpts.kind = kind;
    } catch (e) {
      if (e instanceof Error) {
        requiredOpts.kind = 'transparent';
      } else {
        throw e;
      }
    }
  }

  return await deployImpl(factory, requiredOpts, { proxyAddress, manifest });
}
