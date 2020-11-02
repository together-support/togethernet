export const EGALITARIAN_MODE = 'egalitarian';
export const DIRECT_ACTION_MODE = 'direct-action';
export const FACILITATED_MODE = 'facilitate';

export const roomModes = [
  EGALITARIAN_MODE,
  FACILITATED_MODE,
  DIRECT_ACTION_MODE,
];

export const defaultRooms = {
  ephemeralSpace: {
    mode: EGALITARIAN_MODE,
    ephemeral: true,
    name: 'sitting-in-the-park',
    roomId: 'ephemeralSpace',
  },
  archivalSpace: {
    mode: EGALITARIAN_MODE,
    ephemeral: false,
    name: 'speaking-on-a-stage',
    roomId: 'archivalSpace',
  }
}