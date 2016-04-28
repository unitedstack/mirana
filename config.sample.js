module.exports = {
  'mq': {
    'enabled': true,
    'remotes': ['42.62.101.195'],
    'heartbeat': '60',
    'username': 'openstack',
    'password': '4260ea44d3c55ac74c3241db',
    'port': '5672',
    'sourceExchanges': ['nova', 'neutron', 'cinder', 'glance'],
    'reconnectTimeout': 1000,
    'maxTimeoutLimit': 120000
  },
  'websocket': {
    'port': 5679
  }
}