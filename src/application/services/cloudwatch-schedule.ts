import { dateToCron } from './cronjob'
import { v4 as uuidv4 } from 'uuid'
import AWS from 'aws-sdk'

export interface CloudWatchScheduleArgs {
  dateText: string
}

export const setPutTargetId = (ruleName: string) => `${ruleName}-event-rule`

export async function cloudWatchSchedule({ dateText }: CloudWatchScheduleArgs) {
  const cwevents = new AWS.CloudWatchEvents({ apiVersion: '2015-10-07' })
  const ruleName = uuidv4()

  const date = new Date(dateText)
  const cronExpression = dateToCron(date)

  // create a schedule/rule
  const putRuleParams = {
    Name: ruleName,
    ScheduleExpression: cronExpression,
    State: 'ENABLED',
  }

  const putRule = await cwevents.putRule(putRuleParams).promise()

  // target the lambdas you want to trigger
  const putTargetParams = {
    Rule: ruleName,
    Targets: [
      {
        Arn: String(process.env?.TARGET_FUNCTION_ARN),
        Id: setPutTargetId(ruleName),
        Input: JSON.stringify({ cronExpression, ruleName }),
      },
    ],
  }

  await cwevents.putTargets(putTargetParams).promise()

  return { SourceArn: putRule.RuleArn, cronExpression, ruleName }
}
