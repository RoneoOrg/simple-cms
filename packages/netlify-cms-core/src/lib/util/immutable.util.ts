import { List } from "immutable";

export function isList<K>(obj: any | List<K>): obj is List<K> {
  return List.isList(obj);
}
