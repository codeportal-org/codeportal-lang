import { customAlphabet } from "nanoid"

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"

export const nanoid = customAlphabet(alphabet, 16)
