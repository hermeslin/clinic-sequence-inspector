const admin = require('../utils/firebase/admin');
const config = require('../config');
/**
 *
 */
const acceptEventTypeList = [
  'message',
];

/**
 *
 */
const db = admin.firestore();


/**
 *
 * @param {*} req
 * @param {*} res
 */
module.exports = async (req, res) => {
  try {
    const { event } = req.body;

    if (!acceptEventTypeList.includes(event.type)) {
      res.status(404).send({ message: 'Event Not Exists' });
      return;
    }

    if (event.bot_id === config.slack.botId) {
      res.status(403).send({ message: 'Ignore Bot User' });
      return;
    }

    const collection = db.collection('slack_events');

    // ignore changed message
    if (event.subtype === 'message_changed') {
      res.status(200).send({ message: 'Ignore changed message' });
      return;
    }

    // message deleted
    if (event.subtype === 'message_deleted') {
      const { previous_message: previousMessage } = event;

      if (!previousMessage) {
        res.status(403).send({ message: 'Not Correct Format' });
        return;
      }

      if (previousMessage.bot_id === config.slack.botId) {
        res.status(403).send({ message: 'Ignore Bot message' });
        return;
      }
      await collection.doc(previousMessage.client_msg_id).delete();
    } else {
      await collection.doc(event.client_msg_id).set({
        ...event,
        first_response: false,
      });
    }
    res.status(200).send({ message: 'ok' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server Error' });
    return;
  }
};
