import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
/**
 * cloudwatch target request handler
 * @param event AWS api gateway event
 */
export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.info('Received from ApiGateway:', event)
    console.info('data passed from authorizer', event.requestContext)
    console.log('----99----');
    console.log(JSON.stringify(Date.now()));
    console.log('====99====');
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
