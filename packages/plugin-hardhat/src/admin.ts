import chalk from 'chalk';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractInstance,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
  GetInstanceFunction,
  getProxyAdminFactory,
  attach
} from './utils';

const SUCCESS_CHECK = chalk.keyword('green')('✔') + ' ';
const FAILURE_CROSS = chalk.keyword('red')('✘') + ' ';

export type ChangeAdminFunction = (proxyAddress: string, newAdmin: string) => Promise<void>;
export type TransferProxyAdminOwnershipFunction = (newOwner: string) => Promise<void>;
export type GetInstanceFunction = () => Promise<Contract>;

export function makeChangeProxyAdmin(hre: HardhatRuntimeEnvironment): ChangeAdminFunction {
  return async function changeProxyAdmin(proxyAddress: string, newAdmin: string) {
    const admin = await getManifestAdmin(hre);
    const proxyAdminAddress = await getAdminAddress(hre.network.provider, proxyAddress);

    if (admin.address !== proxyAdminAddress) {
      throw new Error('Proxy admin is not the one registered in the network manifest');
    } else if (admin.address !== newAdmin) {
      await admin.changeProxyAdmin(proxyAddress, newAdmin);
    }
  };
}

export function makeTransferProxyAdminOwnership(env: Environment): TransferProxyAdminOwnershipFunction {
  return async function transferProxyAdminOwnership(newOwner: string): Promise<void> {
    const admin = await getManifestAdmin(env);
    await admin.transferOwnership(newOwner);

    const { provider } = hre.network;
    const manifest = await Manifest.forNetwork(provider);
    const { proxies } = await manifest.read();
    for (const { address, kind } of proxies) {
      if (admin.address == (await getAdminAddress(provider, address))) {
        console.log(SUCCESS_CHECK + `${address} (${kind}) proxy ownership transfered through admin proxy`);
      } else {
        console.log(FAILURE_CROSS + `${address} (${kind}) proxy ownership not affected by admin proxy`);
      }
    }
  };
}

export function makeGetInstanceFunction(env: Environment): GetInstanceFunction {
  return async function getInstance() {
    return await getManifestAdmin(env);
  };
}

export async function getManifestAdmin(env: Environment): Promise<ContractInstance> {
  const { provider } = env.network;
  const manifest = await Manifest.forNetwork(provider);
  const manifestAdmin = await manifest.getAdmin();
  const proxyAdminAddress = manifestAdmin?.address;

  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest');
  }

  const AdminFactory = await getProxyAdminFactory(env);
  return attach(AdminFactory, proxyAdminAddress);
}
