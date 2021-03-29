import {
  E,D,F,I, Options,
  DeployProxyFunction,
  UpgradeProxyFunction,
  PrepareUpgradeFunction,
  GetInstanceFunction,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
} from './types'

import { plugin } from './plugin';

import {
  deployProxy,
  upgradeProxy,
  prepareUpgrade,
  changeProxyAdmin,
  transferProxyAdminOwnership,
  getInstance,
  withDefaults,
} from '@openzeppelin/plugin-common';

export function makeDeployProxy(env: E): DeployProxyFunction {
  return (
    factory: F,
    args: unknown[] | Options = [],
    opts: Options = {}
  ) => {
    if (!Array.isArray(args)) {
      opts = args;
      args = [];
    }
    return deployProxy(plugin, env, factory, args, withDefaults(plugin, { deployer: factory.signer, ...opts }, env));
  }
}

export function makeUpgradeProxy(env: E): UpgradeProxyFunction {
  return (
    proxyAddress: string,
    factory: F,
    opts: Options = {}
  ) => upgradeProxy(plugin, env, proxyAddress, factory, withDefaults(plugin, { deployer: factory.signer, ...opts }, env));
}

export function makePrepareUpgrade(env: E): PrepareUpgradeFunction {
  return (
    proxyAddress: string,
    factory: F,
    opts: Options = {}
  ) => prepareUpgrade(plugin, env, proxyAddress, factory, withDefaults(plugin, { deployer: factory.signer, ...opts }, env));
}

export function makeGetInstance(env: E): GetInstanceFunction {
  return () => getInstance(plugin, env);
}

export function makeChangeProxyAdmin(env: E): ChangeAdminFunction {
  return (
    proxyAddress: string,
    newAdmin: string,
  ) => changeProxyAdmin(plugin, env, proxyAddress, newAdmin);
}

export function makeTransferProxyAdminOwnership(env: E): TransferProxyAdminOwnershipFunction {
  return (
    newOwner: string,
  ) => transferProxyAdminOwnership(plugin, env, newOwner);
}
