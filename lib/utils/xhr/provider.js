'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('object-path');
var axios = require('axios');
var io = typeof io !== 'undefined' ? io : null;

var defaultSocketSuccess = null;
var defaultSocketError = null;
var defaultHttpSuccess = 'data.data';
var defaultHttpError = 'data';

var Provider = exports.Provider = function () {
  function Provider(config, headers, url) {
    _classCallCheck(this, Provider);

    this.config = config;
    this.headers = headers;
    this.url = url;
    this.service = this.config.socket ? new Socket() : new Http();
  }

  //----------------------
  //--- PUBLIC METHODS ---
  //----------------------


  _createClass(Provider, [{
    key: 'get',
    value: function get() {
      this.service.get(this.headers, this.url).then(extractData).catch(extractError);
    }
  }, {
    key: 'post',
    value: function post(data) {
      this.service.post(this.headers, this.url, data).then(extractData).catch(extractError);
    }
  }, {
    key: 'delete',
    value: function _delete(data) {
      this.service.delete(this.headers, this.url).then(extractData).catch(extractError);
    }

    //-----------------------
    //--- PRIVATE METHODS ---
    //-----------------------

  }, {
    key: 'extractData',
    value: function extractData(data) {
      var schema = void 0;

      // Define schemas depending of socket/http
      switch (this.service.constructor.name) {
        case 'Socket':
          schema = path.get(this.config, 'responseSchemas.socket.success') || defaultSocketSuccess;

        case 'Http':
          schema = path.get(this.config, 'responseSchemas.http.success') || defaultHttpSuccess;
      }

      // Returning response
      return schema ? path.get(data, schema) : data;
    }
  }, {
    key: 'extractError',
    value: function extractError() {
      var schema = void 0;

      // Define schemas depending of socket/http
      switch (this.service.constructor.name) {
        case 'Socket':
          schema = path.get(this.config, 'responseSchemas.socket.error') || defaultSocketError;

        case 'Http':
          schema = path.get(this.config, 'responseSchemas.http.error') || defaultHttpError;
      }

      // Returning response
      return schema ? path.get(data, schema) : data;
    }
  }]);

  return Provider;
}();

// Socket classes used by provider class


var Socket = function () {
  function Socket() {
    _classCallCheck(this, Socket);
  }

  _createClass(Socket, [{
    key: 'get',
    value: function get(headers, url) {

      var options = {
        method: 'GET',
        headers: headers,
        url: url
      };

      return this.request(options);
    }
  }, {
    key: 'post',
    value: function post(headers, url, data) {
      var options = {
        method: 'POST',
        headers: headers,
        url: url,
        data: data
      };

      return this.request(options);
    }
  }, {
    key: 'delete',
    value: function _delete(headers, url) {
      var options = {
        method: 'DELETE',
        headers: headers,
        url: url
      };

      return this.request(options);
    }
  }, {
    key: 'request',
    value: function request(config) {
      return new Promise(function (resolve, reject) {

        io.socket.request(config, function (res, JWR) {

          // Check if statusCode is 2xx
          if (JWR.statusCode.match(/^2/)) {
            return resolve(res);
          } else {
            return reject(res);
          }
        });
      });
    }
  }]);

  return Socket;
}();

// Http (axios wrapper) classes used by provider class


var Http = function () {
  function Http() {
    _classCallCheck(this, Http);
  }

  _createClass(Http, [{
    key: 'get',
    value: function get() {
      return axios.get(this.url, this.headers);
    }
  }, {
    key: 'post',
    value: function post(data) {
      return axios.post(this.url, data, this.headers);
    }
  }, {
    key: 'delete',
    value: function _delete() {
      return axios.delete(this.url, this.headers);
    }
  }]);

  return Http;
}();

// module.exports = function providerUtil(hostConfig, method, url, headers, postData){
//
//
// }