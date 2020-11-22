import publicConfig from '../config/index.js';
import Room from '../js/Room.js';

export const EGALITARIAN_MODE = 'egalitarian';
export const DIRECT_ACTION_MODE = 'direct-action';
export const FACILITATED_MODE = 'facilitated';

export const roomModes = {
  egalitarian: EGALITARIAN_MODE,
  directAction: DIRECT_ACTION_MODE,
  facilitated: FACILITATED_MODE,
};

export const defaultRooms = {
  ephemeralSpace: new Room({
    mode: publicConfig.defaultMode || EGALITARIAN_MODE,
    ephemeral: true,
    name: 'sitting-in-the-park',
    roomId: 'ephemeralSpace',
  }),
  archivalSpace: new Room({
    mode: publicConfig.defaultMode || EGALITARIAN_MODE,
    ephemeral: false,
    name: 'speaking-on-a-stage',
    roomId: 'archivalSpace',
  }),
};