const slackWebApi = require('@slack/web-api');
const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('../utils/firebase/admin');
const config = require('../config/index');

/**
 *
 */
const db = admin.firestore();

/**
 *
 */
const { WebClient, LogLevel } = slackWebApi;
const client = new WebClient(config.slack.accessToken, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.ERROR,
});

/**
 *
 * @param {*} context
 */
const onRun = async (context) => {
  try {
    const collection = db.collection('slack_events');

    // get latest entry
    const documentSnapshots = await collection.orderBy('ts').get();

    if (documentSnapshots.docs.length <= 0) {
      console.log('slack_events has no data');
      return null;
    }

    documentSnapshots.docs.forEach(async (document) => {
      const documentId = document.id;
      const documentData = document.data();

      const {
        ts,
        text,
        user,
        first_response: firstResponse,
        channel,
        // subtype,
      } = documentData;

      if (firstResponse === false) {
        client.chat.postMessage({
          channel,
          thread_ts: ts,
          text: 'Start crawling..',
        });

        // update firstResponse
        await collection.doc(documentId).update({ first_response: true });
      }

      // parse doctor and sequence
      const newText = text.replace(/\*/g, '');
      if (!new RegExp(/^.+:\d+$/).test(newText)) {
        return null;
      }
      const [doctor, sequence] = newText.split(':');

      //
      const response = await fetch(`${config.clinic.endpoint}${new Date().getTime()}`).then((res) => res.json());
      const target = Object.values(response.list).find((item) => {
        if (!item) {
          return false;
        }
        const seqBefore = config.clinic.seq_befroe;
        const difSequence = parseInt(sequence, 10) - parseInt(item.seq, 10);
        return item.doctor_name === doctor && difSequence <= seqBefore;
      });

      if (target) {
        await client.chat.postMessage({
          channel,
          thread_ts: ts,
          text: `<@${user}> doctor ${target.doctor_name} number is ${target.seq}`,
        });

        // delete firestore data
        await collection.doc(documentId).delete();
      }
    });

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 *
 */
exports.scheduledFunction =functions.pubsub
    .schedule('every 2 minutes')
    .timeZone('Asia/Taipei')
    .onRun(onRun);

