import { ProtocolRegistry } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/types';

import Issue from './Issue';
import ServicePublication from './ServicePublication';
import Recommendation from './Recommendation';


export const ISSUE = 'issue';
export const REC = 'rec';
export const SP = 'sp';

export const protocols = [
  ISSUE,
  REC,
  SP,
] as const;

export type Protocol = typeof protocols[number];

export function isValidProtocol(val: string): val is Protocol {
  return protocols.indexOf(val as Protocol) >= 0;
}

export const protocolRegistry: ProtocolRegistry<Protocol> = {
  issue: Issue,
  sp: ServicePublication,
  rec: Recommendation,
};
