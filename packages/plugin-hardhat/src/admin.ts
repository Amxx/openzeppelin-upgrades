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

export function makeChangeProxyAdmin(env: Environment): ChangeAdminFunction {
  return async function changeProxyAdmin(proxyAddress: string, newAdmin: string): Promise<void> {
    const admin = await getManifestAdmin(env);
    const proxyAdminAddress = await getAdminAddress(env.network.provider, proxyAddress);

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
