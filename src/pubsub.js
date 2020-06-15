/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* Central event management system. pubSub stands for publish and subscribe.
* Other modules can subscribe by specifying an event name they want to subscribe to
* and a callback that will get executed on that event
* Then any other module can publish (or emit) an event,
* which will trigger all the associated callbacks
*/

export default (() => {
  const events = {};
  const subscribe = (eventName, callbackFn) => {
    events[eventName] = events[eventName] || [];
    events[eventName].push(callbackFn);
  };
  const unsubscribe = (eventName, callbackFn) => {
    if (events[eventName]) {
      events[eventName].forEach((callback, index) => {
        if (callbackFn === callback) events[eventName].splice(index, 1);
      });
    }
  };
  // Note the use of rest-parameters for variable parameters. This isn't required, just convenient
  const emit = (eventName, ...data) => {
    if (events[eventName]) {
      events[eventName].forEach((callback) => callback(...data));
    }
  };
  return { unsubscribe, subscribe, emit };
})();
