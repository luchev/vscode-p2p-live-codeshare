import { fromString, toString } from "uint8arrays";

function serialize(obj: any) {
    return fromString(JSON.stringify(obj))
}

function deserialize<T>(bytes: Uint8Array) {
    return JSON.parse(toString(bytes)) as T
}

export {serialize, deserialize}
