import 'dotenv/config'
import 'reflect-metadata'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import db from '../infrastructure/database/postgres-connection'
import AWS from 'aws-sdk'
import {
  cloudWatchSchedule,
  CloudWatchScheduleArgs,
} from '../services/cloudwatch-schedule'

import { OK } from '../../utils/HttpClient/http-status-codes'

/**
 * cloudwatch schedule request handler
 * @param event AWS api gateway event
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.info('cloudwatch schedule request handler')
  console.log(JSON.stringify(event.requestContext.authorizer))

  try {
    if (!event.body) throw new Error('Invalid request payload')
    const parsedBody = (JSON.parse(event.body) || {}) as CloudWatchScheduleArgs

    console.info('schedule request', { request: parsedBody })

    const { SourceArn, cronExpression, ruleName } = await cloudWatchSchedule(
      parsedBody
    )

    // need change schedule to cronExpression or more meaninful name
    const query = `INSERT INTO schedule_app (id,cron_expression,rule_name) VALUES(:id,:cron_expression,:rule_name)`
    await db.query<{
      id: string
      ['cron_expression']: string
      ['rule_name']: string
    }>(query, {
      id: uuidv4(),
      cron_expression: cronExpression,
      rule_name: ruleName,
    })

    // set lambda permissions related to to schedule created
    const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })
    const lambdaPermissionParams = {
      FunctionName: String(process.env?.TARGET_FUNCTION_NAME) /* required */,
      StatementId: ruleName /* required */,
      Principal: 'events.amazonaws.com' /* required */,
      Action: 'lambda:InvokeFunction' /* required */,
      SourceArn,
    }

    await lambda.addPermission(lambdaPermissionParams).promise()
    return {
      statusCode: OK,
      body: JSON.stringify({ cronExpression }),
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({}),
    }
  }
}
