import ERC1967Proxy                from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json';
import TransparentUpgradeableProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json';
import ProxyAdmin                  from '@openzeppelin/upgrades-core/artifacts//@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json';

import { E,D,F,I } from './types'
import {
  Plugin,
  Artefact,
  GetFactory,
  DeployContract,
  AttachContract,
  EncodeCall,
  ReadValidation,
  GetContractVersion,
} from '@openzeppelin/plugin-common';

import {
  getVersion,
  getUnlinkedBytecode,
  ValidationDataCurrent,
  Version,
} from '@openzeppelin/upgrades-core';

import {
  readValidations
} from '../utils/validations';

function makeFactoryGetter(artifact: Artefact): GetFactory<E,D,F,I> {
  return function (env: E, deployer?: D): Promise<F> {
    // TODO: get deployer from options
    return env.ethers.getContractFactory(artifact.abi, artifact.bytecode, deployer);
  }
}

const deployContract: DeployContract<E,D,F,I> =
  async function(deployer: D, factory: F, ...args: unknown[]): Promise<I> {
    const contract = await (deployer ? factory.connect(deployer) : factory).deploy(...args);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Won't be readonly because inst was created through attach.
    contract.txHash = contract.deployTransaction.hash;
    return contract;
  };

const attachContract: AttachContract<E,D,F,I> =
  function(factory: F, address: string): I {
    return factory.attach(address);
  };

const encodeCall: EncodeCall<E,D,F,I> =
  function(factory: F, signature: string, ...args: unknown[]): string {
    const fragment = factory.interface.getFunction(signature);
    return factory.interface.encodeFunctionData(fragment, args as any[]);
  }

const getContractVersion: GetContractVersion<E,D,F,I> =
  async function (env: E, validations: ValidationDataCurrent, factory: F): Promise<Version> {
    const unlinkedBytecode = getUnlinkedBytecode(validations, factory.bytecode);
    return getVersion(unlinkedBytecode, factory.bytecode);
  }

export const plugin: Plugin<E,D,F,I> = {
  getProvider:                           (env: E) => env.network.provider,
  getDeployer:                           (env: E) => { throw new Error('Cannot extract default deployer from E') },
  getProxyFactory:                       makeFactoryGetter(ERC1967Proxy),
  getTransparentUpgradeableProxyFactory: makeFactoryGetter(TransparentUpgradeableProxy),
  getProxyAdminFactory:                  makeFactoryGetter(ProxyAdmin),
  deployContract,
  attachContract,
  encodeCall,
  readValidations,
  getContractVersion,
};
