module.exports = {
  'mq': {
    'enabled': true,
    'remotes': ['42.62.101.195'],
    //'remotes': ['42.62.93.98'],
    'heartbeat': '60',
    'username': 'openstack',
    'password': '4260ea44d3c55ac74c3241db',
    //'username': 'guest',
    //'password': 'guest',
    'port': '5672',
    'sourceExchanges': ['nova', 'neutron', 'cinder', 'glance'],
    'reconnectTimeout': 1000,
    'maxTimeoutLimit': 120000
  },
  'websocket': {
    'url': ':8080',
    'port': 8080
  }
}