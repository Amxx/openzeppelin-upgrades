import ERC1967Proxy                from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json';
import TransparentUpgradeableProxy from '@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json';
import ProxyAdmin                  from '@openzeppelin/upgrades-core/artifacts//@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json';

import { E,D,F,I } from './types'
import {
  Plugin,
  Artefact,
  GetFactory,
  GetProvider,
  GetDeployer,
  DeployContract,
  AttachContract,
  EncodeCall,
  ReadValidation,
  GetContractVersion,
} from '@openzeppelin/plugin-common';

import {
  EthereumProvider,
  getVersion,
  ValidationDataCurrent,
  Version,
} from '@openzeppelin/upgrades-core';

import {
  TruffleContract,
  getTruffleConfig,
  getTruffleProvider,
  getTruffleDefaults,
} from '../utils/truffle';

import {
  validateArtifacts,
  getLinkedBytecode,
} from '../utils/validations';

import {
  wrapProvider,
} from '../utils/wrap-provider';

function makeFactoryGetter(artifacts: Artefact): GetFactory<E,D,F,I> {
  return function (env: E, deployer?: D): Promise<F> {
    const contract = TruffleContract(artifacts);
    contract.setProvider(deployer?.provider ?? getTruffleProvider()); // template?.currentProvider ??
    contract.defaults(getTruffleDefaults()); // template?.class_defaults ??
    return Promise.resolve(contract);
  };
}

const getProvider: GetProvider<E,D,F,I> =
  function(env?: E): EthereumProvider {
    return wrapProvider(getDeployer(env as E).provider);
  }

const getDeployer: GetDeployer<E,D,F,I> =
  function(env?: E): D {
    return (env && env.deployer) ?? ({
      get provider() {
        return getTruffleConfig().provider;
      },
      async deploy(factory: F, ...args: unknown[]): Promise<I> {
        return factory.new(...args);
      },
    });
  }

const deployContract: DeployContract<E,D,F,I> =
  async function(deployer: D, factory: F, ...args: unknown[]): Promise<I> {
    const { address, transactionHash: txHash } = await deployer.deploy(factory, ...args);
    if (txHash === undefined) {
      throw new Error('Transaction hash is undefined');
    }
    return { ...attachContract(factory, address), txHash };
  };

const attachContract: AttachContract<E,D,F,I> =
  function(factory: F, address: string): I {
    return new factory(address);
  };

const encodeCall: EncodeCall<E,D,F,I> =
  function(factory: F, signature: string, ...args: unknown[]): string {
    const stub = new factory('');
    if (signature in stub.contract.methods) {
      return stub.contract.methods[signature](...args).encodeABI();
    } else {
      throw new Error(`no matching function \`${signature}\` in contract class \`${factory.name}\``);
    }
  }

const readValidations: ReadValidation<E,D,F,I> =
  async function (env: E): Promise<ValidationDataCurrent> {
    const { contracts_build_directory, contracts_directory } = getTruffleConfig();
    return {
      version: '3',
      log: [ await validateArtifacts(contracts_build_directory, contracts_directory) ],
    };
  }

const getContractVersion: GetContractVersion<E,D,F,I> =
  async function (env: E, validations: ValidationDataCurrent, factory: F): Promise<Version> {
    const linkedBytecode = await getLinkedBytecode(factory, getProvider(env));
    return getVersion(factory.bytecode, linkedBytecode);
  }

export const plugin: Plugin<E,D,F,I> = {
  getProvider,
  getDeployer,
  getProxyFactory:                       makeFactoryGetter(ERC1967Proxy),
  getTransparentUpgradeableProxyFactory: makeFactoryGetter(TransparentUpgradeableProxy),
  getProxyAdminFactory:                  makeFactoryGetter(ProxyAdmin),
  deployContract,
  attachContract,
  encodeCall,
  readValidations,
  getContractVersion,
};
