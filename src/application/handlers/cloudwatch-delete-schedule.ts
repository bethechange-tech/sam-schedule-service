import 'dotenv/config'
import 'reflect-metadata'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AWS from 'aws-sdk'

/**
 * cloud watch delete request handler
 * @param event AWS api gateway event
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { scheduleName } = event.pathParameters as { scheduleName: string }
    console.info('delete schedule request', { scheduleName })

    const cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' })
    const deleteRule = await cwevents
      .deleteRule({
        Name: scheduleName,
      })
      .promise()

    return {
      statusCode: 200,
      body: JSON.stringify(deleteRule),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: JSON.stringify({}),
    }
  }
}
