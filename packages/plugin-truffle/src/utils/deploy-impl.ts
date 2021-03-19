import {
  ContractFactory,
  Options,
  getTruffleConfig,
} from '../types/index';

import {
  Manifest,
  assertUpgradeSafe,
  assertStorageUpgradeSafe,
  getStorageLayout,
  fetchOrDeploy,
  getVersion,
  getImplementationAddress,
  getStorageLayoutForAddress,
} from '@openzeppelin/upgrades-core';

import { deploy } from './deploy';
import { validateArtifacts, getLinkedBytecode } from './validations';
import { wrapProvider } from './wrap-provider';

export async function deployImpl(
  factory: ContractFactory,
  requiredOpts: Required<Options>,
  checkStorageUpgrade?: { proxyAddress: string; manifest: Manifest },
): Promise<string> {
  if (requiredOpts.kind === 'transparent') {
    requiredOpts.unsafeAllow.push('no-public-upgrade-fn');
  }

  const provider = wrapProvider(requiredOpts.deployer.provider);
  const { contracts_build_directory, contracts_directory } = getTruffleConfig();
  const validations = await validateArtifacts(contracts_build_directory, contracts_directory);
  const linkedBytecode = await getLinkedBytecode(factory, provider);
  const version = getVersion(factory.bytecode, linkedBytecode);
  const layout = getStorageLayout(validations, version);
  assertUpgradeSafe(validations, version, requiredOpts);

  if (checkStorageUpgrade) {
    const currentImplAddress = await getImplementationAddress(provider, checkStorageUpgrade.proxyAddress);
    const deploymentLayout = await getStorageLayoutForAddress(
      checkStorageUpgrade.manifest,
      validations,
      currentImplAddress,
    );
    const layout = getStorageLayout([validations], version);
    assertStorageUpgradeSafe(deploymentLayout, layout, requiredOpts.unsafeAllowCustomTypes);
  }

  return await fetchOrDeploy(version, provider, async () => {
    const deployment = await deploy(requiredOpts.deployer, Contract);
    return { ...deployment, layout };
  });
}
