import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as path from 'path'
import * as NodejsFunction from 'aws-cdk-lib/aws-lambda-nodejs'

export class WorkingDaysApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const workingDaysLambda = new NodejsFunction.NodejsFunction(this, 'WorkingDaysFunction', {
      entry: path.join(__dirname, 'lambda/handlers/workingDays.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2020',
        externalModules: [
          'aws-sdk',
        ],
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    })
    const api = new apigateway.RestApi(this, 'WorkingDaysApi', {
      restApiName: 'Working Days Service',
      description: 'API for Colombia working days calculation',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    })

    const workingDaysResource = api.root.addResource('working-days')
    workingDaysResource.addMethod('GET', new apigateway.LambdaIntegration(workingDaysLambda))

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: `${api.url}working-days`,
      description: 'Working Days API Endpoint',
      exportName: 'WorkingDaysApiUrl',
    })
  }
}
