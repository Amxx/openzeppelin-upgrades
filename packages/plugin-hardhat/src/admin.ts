import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';
import {
  ContractInstance,
  ChangeAdminFunction,
  TransferProxyAdminOwnershipFunction,
  GetInstanceFunction,
} from './types/index';
import { getProxyAdminFactory, attach } from './utils';

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

export function makeTransferProxyAdminOwnership(hre: HardhatRuntimeEnvironment): TransferProxyAdminOwnershipFunction {
  return async function transferProxyAdminOwnership(newOwner: string) {
    const admin = await getManifestAdmin(hre);
    await admin.transferOwnership(newOwner);
  };
}

export function makeGetInstanceFunction(hre: HardhatRuntimeEnvironment): GetInstanceFunction {
  return async function getInstance() {
    return await getManifestAdmin(hre);
  };
}

export async function getManifestAdmin(hre: HardhatRuntimeEnvironment): Promise<ContractInstance> {
  const manifest = await Manifest.forNetwork(hre.network.provider);
  const manifestAdmin = await manifest.getAdmin();
  const proxyAdminAddress = manifestAdmin?.address;

  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest');
  }

  const AdminFactory = await getProxyAdminFactory(hre);
  return attach(AdminFactory, proxyAdminAddress);
}
