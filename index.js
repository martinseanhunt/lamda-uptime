const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch()

exports.handler = async (event) => {
  let endTime
  let requestWasSuccessful

  const startTime = timeInMs()

  try {
    await axios.get(url)
    requestWasSuccessful = 1
  } catch (e) {
    requestWasSuccessful = 0
  } finally {
    endTime = timeInMs()
  }

  await cloudwatch
    .putMetricData({
      MetricData: [
        // A list of data points to send
        {
          MetricName: 'Success', // Name of a metric
          Dimensions: [
            // A list of key-value pairs that can be used to filter metrics from CloudWatch
            {
              Name: 'ServiceName',
              Value: serviceName,
            },
            { Name: 'Url', Value: url },
          ],
          Unit: 'Count', // Unit of a metric
          Value: requestWasSuccessful, // Value of a metric to store
        },
      ],
      Namespace: 'Udacity/Serveless', // An isolated group of metrics
    })
    .promise()

  await cloudwatch
    .putMetricData({
      MetricData: [
        // A list of data points to send
        {
          MetricName: 'RequestTime', // Name of a metric
          Dimensions: [
            // A list of key-value pairs that can be used to filter metrics from CloudWatch
            {
              Name: 'ServiceName',
              Value: serviceName,
            },
            { Name: 'Url', Value: url },
          ],
          Unit: 'Seconds', // Unit of a metric
          Value: endTime - startTime, // Value of a metric to store
        },
      ],
      Namespace: 'Udacity/Serveless', // An isolated group of metrics
    })
    .promise()
}

function timeInMs() {
  return new Date().getTime()
}
