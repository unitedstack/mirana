'use strict';

var config = require('../config').mq;
var uuid = require('node-uuid');
var amqp = require('amqplib');
var os = require('os');
var logger = require('../middlewares/logger');

function RabbitMqListener (consumer, servers, timeout) {
  this.consumer = consumer;
  this.mqServers = servers;
  this.currentServer = servers[0];
  this.reconnectTimeout = timeout;
}


RabbitMqListener.prototype.connect = function (connectTarget) {
  var queueId;
  var that = this;
  if (connectTarget) {
    this.currentServer = connectTarget;
  }
  var url = 'amqp://' + config.username + ':' + config.password + '@' + this.currentServer + ':' + config.port + '/?heartbeat=' + config.heartbeat;

  amqp.connect(url).then(function(conn) {
    that.reconnectTimeout = 1000;
    process.once('SIGINT', function() {
      conn.close();
    });
    conn.on('error', function (err) {
      logger.error(err);
    });
    conn.on('close', function() {
      that.reconnect(that.currentServer);
    });
    Promise.all(
      config.sourceExchanges.map(s=>{
        conn.createChannel().then(ch=>{
          ch.on('error',logger.error);
          ch.checkExchange(s).then(()=>{
            ch.close();
          }).catch(()=>{
            conn.createChannel().then(chNew=>{
              ch.on('error',logger.error);
              chNew.assertExchange(s,'topic',{
                durable: config.exchangeDurable === true
              }).then(()=>{
                chNew.close();
              })
            })
          })
        })
      })
    ).then(()=>{
      return conn.createChannel();
    }).then(function(ch) {
      var ok = ch.assertExchange('halo', 'fanout', {
        alternateExchange: 'notifications.*',
        durable: config.exchangeDurable === true
      });
      ok.then(function() {
        var _promiseArray = [];
        config.sourceExchanges.forEach(function (s) {
          _promiseArray.push(ch.bindExchange('halo', s, 'notifications.*'));
        });
        return Promise.all(_promiseArray);
      });
      ok = ok.then(function() {
        var hostname = os.hostname();
        queueId = 'halo_' + hostname;
        return ch.assertQueue(queueId, {
          durable: false,
          autoDelete: true
        });
      });
      ok = ok.then(function(qok) {
        return ch.bindQueue(qok.queue, 'halo').then(function() {
          return qok.queue;
        });
      });
      ok = ok.then(function (queue) {
        return ch.consume(queue, that.consumer, {
          noAck: true
        });
      });
      return ok.then(function() {
        console.log('connection to rabbitmq ' + that.currentServer + ' is established successfully');
      });
    });
  }, function (err) {
    logger.error(err);
    var nextTarget = that.getAvailableServer(that.currentServer);
    that.reconnect(nextTarget);
  }).then(null, console.warn);
};

RabbitMqListener.prototype.reconnect = function (connectTarget) {
  var that = this;
  this.reconnectTimeout = this.reconnectTimeout < config.maxTimeoutLimit ? (this.reconnectTimeout + 1000) : config.maxTimeoutLimit;
  console.log(this.reconnectTimeout);
  setTimeout(function () {
    that.connect(connectTarget);
  }, that.reconnectTimeout);
};

RabbitMqListener.prototype.getAvailableServer = function (failServer) {
  var availableServers = this.mqServers.filter(function (el) {
    return el !== failServer;
  });
  var randomIndex = Math.floor(Math.random() * availableServers.length);
  return availableServers[randomIndex];
};

module.exports = RabbitMqListener;
