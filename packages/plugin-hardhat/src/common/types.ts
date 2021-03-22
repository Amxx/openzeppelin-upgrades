import { EthereumProvider, ValidationOptions } from '@openzeppelin/upgrades-core';

// External
export interface Artefact { abi: any; bytecode: string; }
export type Provider = EthereumProvider;

// Options
export type ProxyKind = 'auto' | 'uups' | 'transparent';
export type ProxyInitializer = string | false;

export type Options<E,D,F,I> = ValidationOptions & DeployOptions<E,D,F,I>;
export interface DeployOptions<E,D,F,I> {
  network?: { provider: EthereumProvider };
  deployer?: D;
  kind?: ProxyKind;
  implementation?: {
    initializer: ProxyInitializer;
    constructor: unknown[];
  },
}

// Internal function types
export type GetFactory         <E,D,F,I> = (env: E, deployer?: D) => Promise<F>;
export type GetProvider        <E,D,F,I> = (env: E) => EthereumProvider;
export type GetDeployer        <E,D,F,I> = (env: E) => D;
export type AttachContract     <E,D,F,I> = (factory: F, address: string) => I;
export type DeployContract     <E,D,F,I> = (deployer: D, factory: F, ...args: unknown[]) => Promise<I>;

// Plugin interface
export interface Plugin<E,D,F,I> {
  getProvider:                           GetProvider        <E,D,F,I>;
  getDeployer:                           GetDeployer        <E,D,F,I>;
  getProxyFactory:                       GetFactory         <E,D,F,I>;
  getTransparentUpgradeableProxyFactory: GetFactory         <E,D,F,I>;
  getProxyAdminFactory:                  GetFactory         <E,D,F,I>;
  attachContract:                        AttachContract     <E,D,F,I>;
  deployContract:                        DeployContract     <E,D,F,I>;
}
