import { artwork } from './artwork'
import { artist } from './artist'
import { dj } from './dj'
import { room } from './room'
import { set } from './set'

// 'exhibition' has been replaced by 'room' in Phase 5.
// No Sanity documents of type 'exhibition' existed — safe rename.
export const schemaTypes = [artwork, artist, dj, room, set]
