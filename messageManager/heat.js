
exports.formatter = function (msg, eventTypeArray) {
  var message = {};
  message.resource_type = eventTypeArray[1];
  message.action = eventTypeArray[2];
  message.stage = eventTypeArray[3];
  message.resource_id = msg.payload.stack_identity;
  message.user_id = msg._context_user_id;
  message.resource_name = msg.payload.stack_name;
  return message;
};
