function baseFormatter (msg, originMsg, type) {
  switch (msg.action) {
    case 'create':
      if (!originMsg.payload[msg.resource_type].id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload[msg.resource_type].id;
        msg.resource_name = originMsg.payload[msg.resource_type].name;
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload[msg.resource_type + '_id'];
      break;
    default:
      msg = null;
  }
  return msg;
}


function portFormatter (msg, originMsg) {
  switch (msg.action) {
    case 'create':
    case 'update':
      if (!originMsg.payload.port.id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload.port.id;
        msg.resource_name = originMsg.payload.port.name;
        var deviceOwner = originMsg.payload.port.device_owner;
        if (deviceOwner === 'compute:nova' || deviceOwner === 'compute:None') {
          msg.instance_id = originMsg.payload.port.device_id;
        } else {
          msg.device_id = originMsg.payload.port.device_id;
        }
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload.port_id;
      break;
    default:
      msg = null;
  }
  return msg;
}

function floatingipFormatter (msg, originMsg) {
  switch (msg.action) {
    case 'create':
      if (!originMsg.payload.floatingip.id) {
        msg = null;
      } else {
        msg.resource_id = originMsg.payload.floatingip.id;
        msg.floatingip_address = originMsg.payload.floatingip.floating_ip_address;
      }
      break;
    case 'delete':
      msg.resource_id = originMsg.payload.floatingip_id;
      break;
    case 'update':
      msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.floatingip.id;
      msg.action = originMsg.payload.floatingip.port_id ? 'associate' : 'dissociate';
      msg.floatingip_address = msg.stage === 'end' ? originMsg.payload.floatingip.floating_ip_address : undefined;
      break;
    default:
      msg = null;
  }
  return msg;
}

function routerFormatter (msg, originMsg) {
  if (originMsg.event_type === 'router.update.start') {
    msg.resource_id = originMsg.payload.id;
    msg.action = 'router_update_start';
  } else if (originMsg.event_type === 'router.update.end') {
    msg.resource_id = originMsg.payload.router.id;
    msg.action = 'router_update_end';
  } else if (msg.action === 'interface') {
    msg.resource_id = originMsg.payload.router_interface.id;
    msg.subnet_id = originMsg.payload.router_interface.subnet_id;
    msg.port_id = originMsg.payload.router_interface.port_id;
    msg.network_id = originMsg.payload.router_interface.network_id;
    msg.action = msg.stage === 'delete' ? 'delete_interface' : 'add_interface';
    msg.stage = 'end';
  } else if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else {
    msg = null;
  }
  return msg;
}

function loadbalancerFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.loadbalancer.id;
  } else {
    msg = null;
  }
  return msg;
}

function listenerFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.listener.id;
    if (originMsg.payload.listener.default_pool_id !== undefined) {
      if (originMsg.payload.listener.default_pool_id && Object.keys(originMsg.payload.listener.default_pool_id).length > 0) {
        msg.action = 'set_pool';
      } else {
        msg.action = 'clear_pool';
      }
    }
  } else {
    msg = null;
  }
  return msg;
}

function poolFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.pool.id;
  } else {
    msg = null;
  }
  return msg;
}

function memberFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.member.id;
  } else {
    msg = null;
  }
  return msg;
}

function healthmonitorFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.healthmonitor.id;
  } else {
    msg = null;
  }
  return msg;
}

function securityGroupFormatter (msg, originMsg) {
  if (msg.action === 'create' || msg.action === 'delete') {
    msg = baseFormatter(msg, originMsg);
  } else if (msg.action === 'update'){
    msg.resource_id = msg.stage === 'start' ? originMsg.payload.id : originMsg.payload.security_group.id;
  } else {
    msg = null;
  }
  return msg;
}

exports.formatter = function (originMsg, eventTypeArray) {
  var message = {};
  message.resource_type = eventTypeArray[0];
  message.action = eventTypeArray[1];
  message.stage = eventTypeArray[2];
  switch (message.resource_type) {
    case 'network':
      message = baseFormatter(message, originMsg);
      break;
    case 'subnet':
      message = baseFormatter(message, originMsg);
      break;
    case 'router':
      message = routerFormatter(message, originMsg);
      break;
    case 'port':
      message = portFormatter(message, originMsg);
      break;
    case 'floatingip':
      message = floatingipFormatter(message, originMsg);
      break;
    case 'loadbalancer':
      message = loadbalancerFormatter(message, originMsg);
      break;
    case 'listener':
      message = listenerFormatter(message, originMsg);
      break;
    case 'pool':
      message = poolFormatter(message, originMsg);
      break;
    case 'member':
      message = memberFormatter(message, originMsg);
      break;
    case 'healthmonitor':
      message = healthmonitorFormatter(message, originMsg);
      break;
    case 'security_group':
      message = securityGroupFormatter(message, originMsg);
      break;
    default:
      message = null;
  }
  return message;
};
