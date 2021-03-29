import {
  EthereumProvider,
  ValidationOptions,
  ValidationDataCurrent,
  Version,
} from '@openzeppelin/upgrades-core';

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
  initializer?: ProxyInitializer;
  implArgs?: unknown[];
}

// Internal function types
export type GetFactory         <E,D,F,I> = (env: E, deployer?: D) => Promise<F>;
export type GetProvider        <E,D,F,I> = (env: E) => EthereumProvider;
export type GetDeployer        <E,D,F,I> = (env: E) => D;
export type DeployContract     <E,D,F,I> = (deployer: D, factory: F, ...args: unknown[]) => Promise<I>;
export type AttachContract     <E,D,F,I> = (factory: F, address: string) => I;
export type EncodeCall         <E,D,F,I> = (factory: F, signature: string, ...args: unknown[]) => string;
export type ReadValidation     <E,D,F,I> = (env: E) => Promise<ValidationDataCurrent>
export type GetContractVersion <E,D,F,I> = (env: E, validations: ValidationDataCurrent, factory: F) => Promise<Version>

// Plugin interface
export interface Plugin<E,D,F,I> {
  getProvider:                           GetProvider        <E,D,F,I>;
  getDeployer:                           GetDeployer        <E,D,F,I>;
  getProxyFactory:                       GetFactory         <E,D,F,I>;
  getTransparentUpgradeableProxyFactory: GetFactory         <E,D,F,I>;
  getProxyAdminFactory:                  GetFactory         <E,D,F,I>;
  deployContract:                        DeployContract     <E,D,F,I>;
  attachContract:                        AttachContract     <E,D,F,I>;
  encodeCall:                            EncodeCall         <E,D,F,I>;
  readValidations:                       ReadValidation     <E,D,F,I>;
  getContractVersion:                    GetContractVersion <E,D,F,I>;
}
