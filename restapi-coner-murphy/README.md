# Demo / Tutorial from YT Video

## Reference 
- How to build and test a REST API using AWS API Gateway, Lambda, and DynamoDB via the AWS CDK! = https://www.youtube.com/watch?v=2WuLSLdgvDw

## Initialize the CDK in an app
Create an empty directory and CD into it
```
mkdir aws-cdk-app && CD aws-cdk-app
```

Init the app (example for TypeScript):
```
cdk init app --language typescript
```

## Install the NPM packages
```
npm i aws-lambda --save 
npm i --save-dev @types/aws-lambda
npm i @aws-sdk/lib-dynamodb --save
```

## Deploy 
```
cdk deploy
```

## Test
- Take the returned API key ID from the deployment.  See here:

Example: 
(NOTE: this will be deleted)
AwsCdkAppStack.APIKeyID = abcdexyz12345
AwsCdkAppStack.RestAPIEndpointB14C3C54 = https://b3niqphzt0.execute-api.us-east-1.amazonaws.com/prod/

- get the API key from the ID above
```
aws apigateway get-api-key --api-key API_KEY_ID --include-value
```

- For example `aws apigateway get-api-key --api-key abcdexyz12345 --include-value`

- Output will look something like this:
```
{
    "id": "abcdexyz12345",
    "value": "ABCDE12345FGHIJ67890",
    "name": "AwsCdk-ApiKe-ZYXWV",
    "enabled": true,
    "createdDate": "2023-11-21T12:34:20-05:00",
    "lastUpdatedDate": "2023-11-21T12:34:20-05:00",
    "stageKeys": [],
    "tags": {}
}
```

- copy the value and use for an `x-api-key` header key-value pair in Postman requests to the endpoint (i.e. https://b3niqphzt0.execute-api.us-east-1.amazonaws.com/prod/posts/)

- to test a post request, use the following body:
```
{
	"title": "Example title",
	"description": "Example description for testing Postman",
	"author": "me",
	"publicationDate": "2000-01-01"
}
```

## Delete the app 
NOTE: this may not delete stateful resources like DynamoDB tables, unless specified in the configs
```
cdk destroy
```
