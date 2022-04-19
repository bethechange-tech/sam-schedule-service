import 'dotenv/config'
import 'reflect-metadata'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'
import db from '../infrastructure/database/postgres-connection'

// @TODO need to work cronjob expressions
const dateToCron = (date: Date) => {
  const minutes = date.getMinutes()
  const hours = date.getHours()
  const days = date.getDate()
  const months = date.getMonth() + 1
  const dayOfWeek = date.getDay()

  return `${minutes} ${hours} ${days} ${months} ${dayOfWeek}`
}

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

    const { schedule = '' } = (JSON.parse(event.body) || {}) as { schedule: string }
    console.info('schedule request', { request: { schedule } })

    const cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' })
    const ruleName = uuidv4()

    const dateText = '2022-04-20T01:30:00.123Z'
    const date = new Date(dateText)
    const cron = dateToCron(date)
    console.log(cron) //30 5 9 5 2

    // need change schedule to cronExpression or more meaninful name
    const query = `INSERT INTO schedule (id,schedule) VALUES(:id,:schedule)`
    const test = await db.query(query, {
      id: uuidv4(),
      schedule: `(${schedule})`,
    })

    console.log('----99----')
    console.log(JSON.stringify(test))
    console.log('====99====')

    // create a schedule/rule
    const putRuleParams = {
      Name: ruleName,
      ScheduleExpression: `rate(${cron})`,
      State: 'ENABLED',
    }

    const putRule = await cwevents.putRule(putRuleParams).promise()

    // target the lambdas you want to trigger
    const putTargetParams = {
      Rule: ruleName,
      Targets: [
        {
          Arn: process.env?.TargetFunctionArn as string,
          Id: uuidv4(),
          Input: '{ "key1": "STRING_VALUE", "key2": "STRING_VALUE" }',
        },
      ],
    }

    await cwevents.putTargets(putTargetParams).promise()

    // set lambda permissions related to to schedule created
    const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })
    const lambdaPermissionParams = {
      FunctionName: process.env?.TargetFunctionName as string /* required */,
      StatementId: ruleName /* required */,
      Principal: 'events.amazonaws.com' /* required */,
      Action: 'lambda:InvokeFunction' /* required */,
      SourceArn: putRule.RuleArn,
    }

    await lambda.addPermission(lambdaPermissionParams).promise()
    return {
      statusCode: 200,
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
