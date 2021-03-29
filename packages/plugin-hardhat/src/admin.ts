import { E, I } from './plugin/types'
import { plugin } from './plugin/plugin';
import { getInstance, } from '@openzeppelin/plugin-common';

export function getManifestAdmin(env: E): Promise<I> {
  return getInstance(plugin, env);
}
