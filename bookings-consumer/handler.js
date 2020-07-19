'use strict';

const AWS = require('aws-sdk')
AWS.config.update({
  region: process.env.AWS_REGION
})
const SNS = new AWS.SNS()
const converter = AWS.DynamoDB.Converter
const moment = require('moment')
moment.locale('en-us')
module.exports.listen = async event => {
  const snsPromises = []
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const reserva = converter.unmarshall(record.dynamodb.NewImage)
      snsPromises.push(SNS.publish({
        TopicArn: process.env.SNS_NOTIFICATIONS_TOPIC,
        Message: `Reservation made: the user ${reserva.user.name} (${reserva.user.email}) scheduled an appointment at: ${moment(reserva.date).format('LLLL')}`
      }).promise())
    }
  }
  await Promise.all(snsPromises)
  console.log('Message (s) sent successfully!')
  return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
