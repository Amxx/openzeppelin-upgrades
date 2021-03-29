import {
  Manifest,
  fetchOrDeploy,
  getImplementationAddress,
  getStorageLayout,
  getStorageLayoutForAddress,
  assertStorageUpgradeSafe,
  assertUpgradeSafe,
} from '@openzeppelin/upgrades-core';

import {
  Plugin,
  Options,
} from '../types';

export async function deployImpl<E,D,F,I extends { address: string, txHash?: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  factory: F,
  opts: Required<Options<E,D,F,I>>,
  checkStorageUpgrade?: { proxyAddress: string; manifest: Manifest },
): Promise<string> {
  if (opts.kind === 'transparent') {
    opts.unsafeAllow.push('no-public-upgrade-fn');
  }

  const provider = plugin.getProvider(env);
  const validations = await plugin.readValidations(env);
  const version = await plugin.getContractVersion(env, validations, factory);
  const layout = getStorageLayout(validations, version);
  assertUpgradeSafe(validations, version, opts);

  if (checkStorageUpgrade) {
    const currentImplAddress = await getImplementationAddress(provider, checkStorageUpgrade.proxyAddress);
    const deploymentLayout = await getStorageLayoutForAddress(
      checkStorageUpgrade.manifest,
      validations,
      currentImplAddress,
    );
    assertStorageUpgradeSafe(deploymentLayout, layout, opts.unsafeAllowCustomTypes);
  }

  return fetchOrDeploy(version, provider, async () => {
    const { address, txHash } = await plugin.deployContract(
      opts.deployer,
      factory,
      ...opts.implArgs,
    );
    return { address, txHash, layout };
  });
}
