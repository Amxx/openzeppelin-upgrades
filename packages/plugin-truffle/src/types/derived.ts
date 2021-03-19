import {
  ContractFactory,
  ContractInstance,
  Deployer,
} from './template';

import {
  Options,
} from './options';


export interface DeployProxyFunction {
  (factory: ContractFactory, args?: unknown[], opts?: Options): Promise<ContractInstance>;
  (factory: ContractFactory, opts?: Options): Promise<ContractInstance>;
}

export interface UpgradeProxyFunction {
  (proxyAddress: string, factory: ContractFactory, opts?: Options): Promise<ContractInstance>;
}

export interface PrepareUpgradeFunction {
  (proxyAddress: string, factory: ContractFactory, opts?: Options): Promise<string>;
}

export type ChangeAdminFunction = (proxyAddress: string, newAdmin: string) => Promise<void>;
export type TransferProxyAdminOwnershipFunction = (newOwner: string) => Promise<void>;
export type GetInstanceFunction = () => Promise<ContractInstance>;
