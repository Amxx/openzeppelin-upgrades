import { Manifest } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractFactory,
  PrepareUpgradeFunction,
  Options,
  withDefaults,
  deployImpl,
} from './utils';

export const prepareUpgrade: PrepareUpgradeFunction = async function (
  proxyAddress: string,
  factory: ContractFactory,
  opts: Options = {},
): Promise<string> {
  const requiredOpts: Required<Options> = withDefaults(opts);
  const env: Environment = requiredOpts;

  const { provider } = env.network;
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

  return await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
}
