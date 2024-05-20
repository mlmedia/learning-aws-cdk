# AWS CDK Templates and Examples

Collection of templates and base apps using the AWS CDK

## Initialize the CDK in an app

Create an empty directory and CD into it

```
mkdir my-example-cdk-app && cd my-example-cdk-app
```

Init the app (example for TypeScript):

```
cdk init app --language typescript
```

## Delete the app

NOTE: this may not delete stateful resources like DynamoDB tables, unless specified in the configs

```
cdk destroy
```
