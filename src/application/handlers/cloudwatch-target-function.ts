/**
 * cloudwatch target request handler
 * @param event cloud watch input event
 */
export const lambdaHandler = async (
  event: Record<string, any>
): Promise<void> => {
  try {
    console.info('Received from ApiGateway:', event)
    console.info('data passed from authorizer', event.requestContext)
    console.log('----99----');
    console.log(JSON.stringify(Date.now()));
    console.log('====99====');
  } catch (err) {
    console.error(err)
  }
}
