export { silenceWarnings } from '@openzeppelin/upgrades-core';

import {
  E,D,F,I, Options,
  DeployProxyFunction,
  UpgradeProxyFunction,
  PrepareUpgradeFunction,
  GetInstanceFunction,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
} from './plugin/types'

import { plugin } from './plugin/plugin';

import {
  deployProxy                 as deployProxyCommon,
  upgradeProxy                as upgradeProxyCommon,
  prepareUpgrade              as prepareUpgradeCommon,
  changeProxyAdmin            as changeProxyAdminCommon,
  transferProxyAdminOwnership as transferProxyAdminOwnershipCommon,
  getInstance                 as getInstanceCommon,
  withDefaults,
} from '@openzeppelin/plugin-common';

export const deployProxy: DeployProxyFunction =
  function(
    factory: F,
    args: unknown[] | Options = [],
    opts: Options = {}
  ) {
    if (!Array.isArray(args)) {
      opts = args;
      args = [];
    }
    const requiredOpts: Required<Options> = withDefaults(plugin, opts, opts as E);
    return deployProxyCommon(plugin, requiredOpts, factory, args, requiredOpts);
  }

export const upgradeProxy: UpgradeProxyFunction =
  function (
    proxyAddress: string,
    factory: F,
    opts: Options = {},
  ): Promise<I> {
    const requiredOpts: Required<Options> = withDefaults(plugin, opts, opts as E);
    return upgradeProxyCommon(plugin, requiredOpts, proxyAddress, factory, requiredOpts);
  }

export const prepareUpgrade: PrepareUpgradeFunction =
  function (
    proxyAddress: string,
    factory: F,
    opts: Options = {},
  ): Promise<string> {
    const requiredOpts: Required<Options> = withDefaults(plugin, opts, opts as E);
    return prepareUpgradeCommon(plugin, requiredOpts, proxyAddress, factory, requiredOpts);
  }

export const admin = {
  getInstance: (
    () => getInstanceCommon(plugin, withDefaults(plugin, {}, undefined as unknown as E))
  ) as GetInstanceFunction,

  changeProxyAdmin: (
    (proxyAddress: string, newAdmin: string) => changeProxyAdminCommon(plugin, withDefaults(plugin, {}, undefined as unknown as E), proxyAddress, newAdmin)
  ) as ChangeAdminFunction,

  transferProxyAdminOwnership: (
    (newOwner: string) => transferProxyAdminOwnershipCommon(plugin, withDefaults(plugin, {}, undefined as unknown as E), newOwner)
  ) as TransferProxyAdminOwnershipFunction,
}
