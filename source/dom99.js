// singleton from dom99create
import {
    create,
    scopeFromArray,
    scopeFromEvent,
    parentScope,
    createElement2,
    leafName,
    leafIndex,
} from "./dom99create.js";
import { defaultOptions } from "./defaultOptions.js";

/* to overwrite some options: 
const options = Object.assign({}, defaultOptions, providedOptions); */

const {
    start,
    elements,
    functions,
    variables,
    get,
    element,
    feed,
    plugin,
} = create(defaultOptions);


export {
    start,
    elements,
    functions,
    variables,
    get,
    element,
    feed,
    plugin,

    scopeFromArray,
    scopeFromEvent,
    parentScope,
    leafName,
    leafIndex,

    createElement2,
};
