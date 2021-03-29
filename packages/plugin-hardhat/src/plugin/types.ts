import { HardhatRuntimeEnvironment  } from 'hardhat/types';
import { Signer                     } from '@ethersproject/abstract-signer';
import { ContractFactory            } from '@ethersproject/contracts';
import { Contract                   } from '@ethersproject/contracts';
import { Options as OptionsTemplate } from '@openzeppelin/plugin-common';

export type E       = HardhatRuntimeEnvironment;
export type D       = Signer;
export type F       = ContractFactory;
export type I       = Contract;
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
