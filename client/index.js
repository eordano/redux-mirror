'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeHooks = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var constants = {
  newClient: 'newClient',
  state: 'state',
  resizeWindow: 'resizeWindow',
  action: 'action',
  mouseMovement: 'mouseMovement',
  scroll: 'scroll'
};

var makeAction = function makeAction(payload) {
  return makeMessage(constants.action, payload || {});
};

var makeMessage = function makeMessage(type, payload) {
  return (0, _stringify2.default)((0, _assign2.default)({ type: type }, payload));
};

var getWindowSize = function getWindowSize() {
  var width = window.innerWidth,
      height = window.innerHeight;
  return { width: width, height: height };
};

var getScroll = function getScroll() {
  /**
   * Taken out of Stack Overflow. Source:
   * http://stackoverflow.com/a/14384091/182855
   */
  var top = window.pageYOffset || document.documentElement.scrollTop,
      left = window.pageXOffset || document.documentElement.scrollLeft;
  return { left: left, top: top };
};

var mouseListener = void 0,
    scrollListener = void 0,
    resizeListener = void 0;

var hookToWindowEvents = function hookToWindowEvents(send) {
  if (!window.addEventListener) {
    console.log('User agent does not implement the addEventListener interface.\n                Window events will not be logged.');
    return;
  }
  if (mouseListener || scrollListener || resizeListener) {
    console.log('Listener hooks are already connected. Call the "removeHooks" function before\n                adding new listeners to the DOM.');
    return;
  }

  mouseListener = function mouseListener(ev) {
    send(makeMessage(constants.mouseMovement, { x: ev.clientX, y: ev.clientY }));
  };
  window.addEventListener('mousemove', mouseListener);

  scrollListener = function scrollListener(ev) {
    send(makeMessage(constants.scroll, getScroll()));
  };
  window.addEventListener('scroll', scrollListener);

  resizeListener = function resizeListener(ev) {
    send(makeMessage(constants.resizeWindow, getWindowSize()));
  };
  window.addEventListener('resize', resizeListener);
};

var currentState = function currentState(store) {
  return {
    windowSize: getWindowSize(),
    scroll: getScroll(),
    state: store.getState()
  };
};

var mirror = function mirror(config) {
  return function (store) {

    var socket = new _socket2.default(config.serverEndpoint);
    var queue = [];
    var connected = true;

    socket.on('connect', function () {
      while (queue.length) {
        var headMessage = queue.shift(1);
        socket.send(headMessage);
      }
      connected = true;
    });

    socket.on('disconnect', function () {
      connected = false;
      send(makeMessage(constants.disconnected));
    });

    socket.on('stateQuery', function () {
      send(makeMessage(constants.state, currentState(store)));
    });

    var send = function send(message) {
      if (!connected) {
        return queue.push(message);
      }
      return socket.send(message);
    };

    send(makeMessage(constants.newClient, currentState(store)));

    hookToWindowEvents(send);

    return function (next) {
      return function (action) {
        var result = next(action);
        send(makeAction({ newState: store.getState(), action: action }));
        return result;
      };
    };
  };
};

var removeHooks = exports.removeHooks = function removeHooks() {
  if (!window.removeEventListener) {
    return;
  }
  window.removeEventListener('mousemove', mouseListener);
  window.removeEventListener('scroll', scrollListener);
  window.removeEventListener('resize', resizeListener);

  mouseListener = scrollListener = resizeListener = null;
};

exports.default = mirror;

