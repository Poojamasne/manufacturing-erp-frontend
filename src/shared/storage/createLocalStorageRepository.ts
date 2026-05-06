import {
  readStorageValue,
  removeStorageValue,
  writeStorageValue,
} from "./localStorage";
import { createPrefixedId } from "../utils/createId";

export interface BaseStoredEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEntityPayload<T extends BaseStoredEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
> &
  Partial<Pick<T, "id">>;

export interface LocalStorageRepositoryOptions<T extends BaseStoredEntity> {
  storageKey: string;
  seed?: T[];
  idPrefix?: string;
}

export function createLocalStorageRepository<T extends BaseStoredEntity>(
  options: LocalStorageRepositoryOptions<T>
) {
  const fallbackData = options.seed ? [...options.seed] : [];
  const idPrefix = options.idPrefix ?? options.storageKey;

  const read = () => readStorageValue<T[]>(options.storageKey, fallbackData);
  const write = (records: T[]) => writeStorageValue(options.storageKey, records);
  const touch = (record: T) => ({
    ...record,
    updatedAt: new Date().toISOString(),
  });

  return {
    storageKey: options.storageKey,
    seedIfEmpty() {
      const currentRecords = read();

      if (currentRecords.length === 0 && options.seed && options.seed.length > 0) {
        write([...options.seed]);
        return [...options.seed];
      }

      return currentRecords;
    },
    list() {
      return read();
    },
    getById(id: string) {
      return read().find((record) => record.id === id) ?? null;
    },
    create(payload: CreateEntityPayload<T>) {
      const now = new Date().toISOString();
      const newRecord = {
        ...payload,
        id: payload.id ?? createPrefixedId(idPrefix),
        createdAt: now,
        updatedAt: now,
      } as T;

      write([...read(), newRecord]);

      return newRecord;
    },
    update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>) {
      const nextRecords = read().map((record) => {
        if (record.id !== id) {
          return record;
        }

        return touch({
          ...record,
          ...patch,
        });
      });

      write(nextRecords);

      return nextRecords.find((record) => record.id === id) ?? null;
    },
    upsert(record: T) {
      const currentRecords = read();
      const exists = currentRecords.some((item) => item.id === record.id);
      const nextRecord = touch(record);
      const nextRecords = exists
        ? currentRecords.map((item) => (item.id === record.id ? nextRecord : item))
        : [...currentRecords, nextRecord];

      write(nextRecords);

      return nextRecord;
    },
    remove(id: string) {
      const nextRecords = read().filter((record) => record.id !== id);
      write(nextRecords);
      return nextRecords;
    },
    clear() {
      removeStorageValue(options.storageKey);
    },
    replaceAll(records: T[]) {
      write([...records]);
      return [...records];
    },
  };
}
