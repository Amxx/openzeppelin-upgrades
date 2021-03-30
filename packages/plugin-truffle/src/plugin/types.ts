import { EthereumProvider           } from '@openzeppelin/upgrades-core';
import { Deployer                   } from '../utils/truffle';
import { ContractClass              } from '../utils/truffle';
import { ContractInstance           } from '../utils/truffle';
import { Options as OptionsTemplate } from '@openzeppelin/plugin-common';

export interface Environment {
  network: { provider: EthereumProvider };
  deployer: Deployer;
};

export type E       = Environment;
export type D       = Deployer;
export type F       = ContractClass;
export type I       = ContractInstance;
export type Options = OptionsTemplate<E,D,F,I>;

export interface DeployProxyFunction {
  (factory: F, args?: unknown[], opts?: Options): Promise<I>;
  (factory: F, opts?: Options): Promise<I>;
}

export interface UpgradeProxyFunction {
  (proxyAddress: string, factory: F, opts?: Options): Promise<I>;
}

export interface PrepareUpgradeFunction {
  (proxyAddress: string, factory: F, opts?: Options): Promise<string>;
}

export interface GetInstanceFunction {
  (): Promise<I>;
}

export interface ChangeAdminFunction {
  (proxyAddress: string, newAdmin: string): Promise<void>;
}

export interface TransferProxyAdminOwnershipFunction {
  (newOwner: string): Promise<void>;
}
