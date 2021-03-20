import {
  ContractFactory,
  ContractInstance,
  Deployer,
  Provider,
} from '../specialize/types';

export * from '../specialize/types';

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

export interface ChangeAdminFunction {
  (proxyAddress: string, newAdmin: string): Promise<void>;
}

export interface TransferProxyAdminOwnershipFunction {
  (newOwner: string): Promise<void>;
}

export interface GetInstanceFunction {
  (): Promise<ContractInstance>;
}

import { ValidationOptions } from '@openzeppelin/upgrades-core';

export type Options = DeployOptions & ValidationOptions;
export type ProxyKind = 'auto' | 'uups' | 'transparent';
export type ProxyInitializer = string | false;

export interface DeployOptions {
  deployer?: Deployer;
  provider?: Provider;
  initializer?: ProxyInitializer;
  kind?: ProxyKind;
}
