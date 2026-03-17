import { customAlphabet } from 'nanoid'
import { numbers } from 'nanoid-dictionary'

/**
 * Create a unique ID for the websocket connection. By default returns
 * a 6 digit numeric code.
 * @param {string} [alphabet] Custom alphabet, for example numbers
 * @param {number} [length] integer for number of digits in the code
 * @returns {ReturnType<typeof customAlphabet>}
 */
export function Code (alphabet?:string, length?:number):string {
    return customAlphabet(alphabet || numbers, length ?? 6)()
}

/**
 * Create a new short ID string of random letters.
 * It should be selectable with a double click.
 * @returns {string} a short ID
 */
export function createId (size:number = 10):string {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    const nanoid = customAlphabet(alphabet, size)
    return nanoid()
}
