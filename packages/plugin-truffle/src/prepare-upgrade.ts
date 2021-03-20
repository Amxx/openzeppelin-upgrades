import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

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

  const { provider } = env;
  const manifest = await Manifest.forNetwork(provider);

  // Autodetect proxy type
  const adminAddress = await getAdminAddress(provider, proxyAddress);
  if (requiredOpts.kind === 'auto') {
    requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
  }

  return await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
}
