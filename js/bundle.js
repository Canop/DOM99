(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//dom99.js

module.exports = (function () {
    "use strict";
    let vars = {},
        nodesWhichShareVars = {},
        nodes = {},
        fx = {};
        
    const 
        customAttribueNameBind = "data-99-bind",
        customAttribueNameVar = "data-99-var",
        customAttribueNameNode = "data-99-node",
        attributeValueDoneSign = "☀",
        
 
        walkTheDom = function (node, aFunction) {
            aFunction(node);
            node = node.firstChild;
            while (node) {
                walkTheDom(node, aFunction);
                node = node.nextSibling;
            }
        },
    
        addEventListener = function (node, eventName, aFunction, useCapture=false) {
            //add here attachEvent for old IE if you want
            node.addEventListener(eventName, aFunction, useCapture);
        },
    
        //not used, tested yet
        onceAddEventListener = function (node, eventName, aFunction, useCapture=false) {
            let tempFunction = function (event) {
                //called once only
                aFunction(event);
                node.removeEventListener(eventName, tempFunction, useCapture);
            };
            addEventListener(node, eventName, tempFunction, useCapture);
        },
    
        applyBind = function (node, directiveTokens) {
            /*directiveTokens example : ["keyup,click", "calculate"] */
            let eventNames = directiveTokens[0],
                functionName = directiveTokens[1],
                /*functionLookUp allows us to store function in dom99.fx after 
                dom99.linkJsAndDom() */
                functionLookUp = function(event) {
                    fx[functionName](event);
                };
                
            eventNames.split(",").forEach(function (eventName) {
                addEventListener(node, eventName, functionLookUp);
            });
            
        },
    
        applyVar = function (node, directiveTokens) {
            /* two-way bind
            example : called for <input data-99-var="a" >
            in this example the variableName = "a"
            we push the <input data-99-var="a" > node in the array
            that holds all nodes which share this same "a" variable
            everytime "a" is changed we change all those nodes values
            and also 1 private js variable (named x below) 
            The public dom99.vars.a variable returns this private js variable
            
            undefined assignment are ignored, instead use empty string( more DOM friendly)*/
            let variableName = directiveTokens[0],
                temp;
            
            /*we check if the user already saved data in vars[variableName]
            before using linkJsAndDom , if that is the case we
            initialize vars[variableName] with that same data once we defined
            our custom property*/
            if (vars.hasOwnProperty(variableName)) {
                temp = vars[variableName];
            }
            
            if (!nodesWhichShareVars[variableName]) {
                let x; // holds the value
                nodesWhichShareVars[variableName] = [node];
                Object.defineProperty(vars, variableName, {
                    get: function () {
                        return x;
                    },
                    set: function (newValue) {
                        if (newValue === undefined) {
                            return;
                        }
                        x = newValue;
                        nodesWhichShareVars[variableName].forEach(function (node) {
                            /*here we change the value of the node in the dom
                            if the node is an <input> it will have a node.value !== undefined
                            and we change this property, for other elements like <p> we directly change .textContent property instead*/
                            if (node.value !== undefined &&
                                node.value !== newValue){//don t overwrite the same in case the node itself launched this
                                node.value = newValue;
                            } else {
                                node.textContent = newValue;
                            }
                        });
                    },
                    enumerable: true,
                    configurable: false
                    //doesn't make sense to have a value property: __value__ because the get and set is a logical value in a way
                });
            } else {
                nodesWhichShareVars[variableName].push(node);
            }
            
            if (temp !== undefined) {
                vars[variableName] = temp; //calls the set once
            }
            addEventListener(node, "input",  function (event) {
                // works fine for <input>
                //todo find solution for all kinds of widgets that have user editable content
                vars[variableName] = event.target.value;
                
            });
        },
    
        applyNode = function (node, directiveTokens) {
            // stores node for direct access !
            if (!nodes[directiveTokens[0]]) {
                nodes[directiveTokens[0]] = node;
            } else {
                console.error("cannot have 2 nodes with the same name");
            }
        },
    
        tryApplyDirective = function (node, customAttribueName, ApplyADirective) {
            let customAttributeValue;
            if (node.hasAttribute(customAttribueName)) {
                customAttributeValue = node.getAttribute(customAttribueName);
                if (!customAttributeValue.startsWith(attributeValueDoneSign)) {
                    // for data-99-bind="keyup,click-calculate"
                    // ["keyup,click", "calculate"] is sent to ApplyADirective
                    ApplyADirective(node, customAttributeValue.split("-"));
                    // ensure the directive is only applied once
                    node.setAttribute(customAttribueName, attributeValueDoneSign + customAttributeValue);
                }
            }
        },
    
        tryApplyDirectives = function (node) {
            if (node.hasAttribute) {
                tryApplyDirective(node, customAttribueNameBind, applyBind);
                tryApplyDirective(node, customAttribueNameVar, applyVar);
                tryApplyDirective(node, customAttribueNameNode, applyNode);
            }
        },
    
        linkJsAndDom = function (startNode=document.body) {
            walkTheDom(startNode, tryApplyDirectives);
        };
    
    // we return a public interface that can be used in the program
    return Object.freeze({
        vars,  // variables shared between UI and program
        nodes, // preselected nodes
        fx,  //object to be filled by user defined functions 
        // this is where dom99 will look for , for data-99-bind 
        linkJsAndDom // initialization function
    });
}());

},{}],2:[function(require,module,exports){
"use strict";
const
    dom99 = require('./dom99.js');
    
dom99.fx.calculate = function (event) {
    
    dom99.vars.result = String(
        parseInt(dom99.vars.a, 10) *
        parseInt(dom99.vars.b, 10)
    );
};


// 4 Link the document and the event handlers
dom99.linkJsAndDom(); //now we listen to events

// 5 initialize
dom99.vars.a = String(2);
dom99.vars.b = String(4);

dom99.fx.calculate();

},{"./dom99.js":1}]},{},[2]);
