import { StoreJSON } from '../Store'
import { isV1 } from './v1'
import { isV2, migrateV2 } from './v2'

export function migrate(json: any): StoreJSON {
  let migrated = json

  if (isV1(migrated)) {
    migrated = migrateV2(migrated)
  }

  if (!isV2(migrated)) {
    throw Error(`Config is an unrecognised version <${json.version ?? 'none'}`)
  }

  return migrated
}
