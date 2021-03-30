import { E, Options } from '../plugin/types';
import { plugin } from '../plugin/plugin';
import { withDefaults as withDefaultsCommon } from '@openzeppelin/plugin-common';

export function withDefaults(env: E): Required<Options> {
  return withDefaultsCommon(plugin, {}, env);
}
