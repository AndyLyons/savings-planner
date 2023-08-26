import { StoreSnapshotOut } from '../Store'
import { isV1 } from './v1'
import { isV2, migrateV2 } from './v2'
import { isV3, migrateV3 } from './v3'
import { isV4, migrateV4 } from './v4'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrate(snapshot: any): StoreSnapshotOut {
  let migrated = snapshot

  if (isV1(migrated)) {
    migrated = migrateV2(migrated)
  }

  if (isV2(migrated)) {
    migrated = migrateV3(migrated)
  }

  if (isV3(migrated)) {
    migrated = migrateV4(migrated)
  }

  if (!isV4(migrated)) {
    throw Error(`Config is an unrecognised version ${snapshot.version ?? 'none'}`)
  }

  return migrated
}
