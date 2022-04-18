import 'dotenv/config'
import 'reflect-metadata'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'

/**
 * cloudwatch schedule request handler
 * @param event AWS api gateway event
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) throw new Error('Invalid request payload')

    const scheduleParsedBody = JSON.parse(event.body) as {}
    console.info('schedule request', { request: scheduleParsedBody })

    const cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' })
    const ruleName = uuidv4()

    // create a schedule/rule
    const putRuleParams = {
      Name: ruleName,
      ScheduleExpression: 'rate(2 minutes)',
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
