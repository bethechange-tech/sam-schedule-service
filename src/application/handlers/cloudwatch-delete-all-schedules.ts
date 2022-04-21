import 'dotenv/config'
import 'reflect-metadata'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AWS from 'aws-sdk'
import { PromisePool } from '@supercharge/promise-pool/dist'
import { setPutTargetId } from '../services/cloudwatch-schedule'
import { NO_CONTENT } from '../../utils/HttpClient/http-status-codes'
/**
 * cloud watch delete request handler
 * @param event AWS api gateway event
 */
export const lambdaHandler = async (
  _: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' })
    const list = await cwevents.listRules().promise()

    await PromisePool.withConcurrency(5)
      .for(list.Rules!)
      .process(async (rule) => {
        const ruleName = String(rule.Name)

        await cwevents
          .removeTargets({
            Rule: ruleName,
            Ids: [setPutTargetId(ruleName)],
          })
          .promise()

        return cwevents
          .deleteRule({
            Name: ruleName,
          })
          .promise()
      })

    return {
      statusCode: NO_CONTENT,
      body: JSON.stringify({}),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: JSON.stringify({}),
    }
  }
}
