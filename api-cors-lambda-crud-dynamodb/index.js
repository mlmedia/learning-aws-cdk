"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCorsOptions = exports.ApiLambdaCrudDynamoDBStack = void 0;
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
class ApiLambdaCrudDynamoDBStack extends aws_cdk_lib_1.Stack {
    constructor(app, id) {
        super(app, id);
        const dynamoTable = new aws_dynamodb_1.Table(this, "items", {
            partitionKey: {
                name: "itemId",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            tableName: "items",
            /**
             *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new table, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will delete the table (even if it has data in it)
             */
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY, // NOT recommended for production code
        });
        const nodeJsFunctionProps = {
            bundling: {
                externalModules: [
                    "aws-sdk", // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            depsLockFilePath: (0, path_1.join)(__dirname, "lambdas", "package-lock.json"),
            environment: {
                PRIMARY_KEY: "itemId",
                TABLE_NAME: dynamoTable.tableName,
            },
            //runtime: Runtime.NODEJS_14_X,å
            runtime: aws_lambda_1.Runtime.NODEJS_18_X,
        };
        // Create a Lambda function for each of the CRUD operations
        const getOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, "getOneItemFunction", {
            entry: (0, path_1.join)(__dirname, "lambdas", "get-one.ts"),
            ...nodeJsFunctionProps,
        });
        const getAllLambda = new aws_lambda_nodejs_1.NodejsFunction(this, "getAllItemsFunction", {
            entry: (0, path_1.join)(__dirname, "lambdas", "get-all.ts"),
            ...nodeJsFunctionProps,
        });
        const createOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, "createItemFunction", {
            entry: (0, path_1.join)(__dirname, "lambdas", "create.ts"),
            ...nodeJsFunctionProps,
        });
        const updateOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, "updateItemFunction", {
            entry: (0, path_1.join)(__dirname, "lambdas", "update-one.ts"),
            ...nodeJsFunctionProps,
        });
        const deleteOneLambda = new aws_lambda_nodejs_1.NodejsFunction(this, "deleteItemFunction", {
            entry: (0, path_1.join)(__dirname, "lambdas", "delete-one.ts"),
            ...nodeJsFunctionProps,
        });
        // Grant the Lambda function read access to the DynamoDB table
        dynamoTable.grantReadWriteData(getAllLambda);
        dynamoTable.grantReadWriteData(getOneLambda);
        dynamoTable.grantReadWriteData(createOneLambda);
        dynamoTable.grantReadWriteData(updateOneLambda);
        dynamoTable.grantReadWriteData(deleteOneLambda);
        // Integrate the Lambda functions with the API Gateway resource
        const getAllIntegration = new aws_apigateway_1.LambdaIntegration(getAllLambda);
        const createOneIntegration = new aws_apigateway_1.LambdaIntegration(createOneLambda);
        const getOneIntegration = new aws_apigateway_1.LambdaIntegration(getOneLambda);
        const updateOneIntegration = new aws_apigateway_1.LambdaIntegration(updateOneLambda);
        const deleteOneIntegration = new aws_apigateway_1.LambdaIntegration(deleteOneLambda);
        // Create an API Gateway resource for each of the CRUD operations
        const api = new aws_apigateway_1.RestApi(this, "itemsApi", {
            restApiName: "Items Service",
            // In case you want to manage binary types, uncomment the following
            // binaryMediaTypes: ["*/*"],
        });
        const items = api.root.addResource("items");
        items.addMethod("GET", getAllIntegration);
        items.addMethod("POST", createOneIntegration);
        addCorsOptions(items);
        const singleItem = items.addResource("{id}");
        singleItem.addMethod("GET", getOneIntegration);
        singleItem.addMethod("PATCH", updateOneIntegration);
        singleItem.addMethod("DELETE", deleteOneIntegration);
        addCorsOptions(singleItem);
    }
}
exports.ApiLambdaCrudDynamoDBStack = ApiLambdaCrudDynamoDBStack;
function addCorsOptions(apiResource) {
    apiResource.addMethod("OPTIONS", new aws_apigateway_1.MockIntegration({
        // In case you want to use binary media types, uncomment the following line
        // contentHandling: ContentHandling.CONVERT_TO_TEXT,
        integrationResponses: [
            {
                statusCode: "200",
                responseParameters: {
                    "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                    "method.response.header.Access-Control-Allow-Origin": "'*'",
                    "method.response.header.Access-Control-Allow-Credentials": "'false'",
                    "method.response.header.Access-Control-Allow-Methods": "'OPTIONS,GET,PUT,POST,DELETE'",
                },
            },
        ],
        // In case you want to use binary media types, comment out the following line
        passthroughBehavior: aws_apigateway_1.PassthroughBehavior.NEVER,
        requestTemplates: {
            "application/json": '{"statusCode": 200}',
        },
    }), {
        methodResponses: [
            {
                statusCode: "200",
                responseParameters: {
                    "method.response.header.Access-Control-Allow-Headers": true,
                    "method.response.header.Access-Control-Allow-Methods": true,
                    "method.response.header.Access-Control-Allow-Credentials": true,
                    "method.response.header.Access-Control-Allow-Origin": true,
                },
            },
        ],
    });
}
exports.addCorsOptions = addCorsOptions;
const app = new aws_cdk_lib_1.App();
new ApiLambdaCrudDynamoDBStack(app, "ApiLambdaCrudDynamoDBExample");
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFNb0M7QUFDcEMsMkRBQWdFO0FBQ2hFLHVEQUFpRDtBQUNqRCw2Q0FBd0Q7QUFDeEQscUVBR3VDO0FBQ3ZDLCtCQUE0QjtBQUU1QixNQUFhLDBCQUEyQixTQUFRLG1CQUFLO0lBQ3BELFlBQVksR0FBUSxFQUFFLEVBQVU7UUFDL0IsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVmLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzVDLFlBQVksRUFBRTtnQkFDYixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2FBQzFCO1lBQ0QsU0FBUyxFQUFFLE9BQU87WUFFbEI7Ozs7ZUFJRztZQUNILGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU8sRUFBRSxzQ0FBc0M7U0FDNUUsQ0FBQyxDQUFDO1FBRUgsTUFBTSxtQkFBbUIsR0FBd0I7WUFDaEQsUUFBUSxFQUFFO2dCQUNULGVBQWUsRUFBRTtvQkFDaEIsU0FBUyxFQUFFLG9EQUFvRDtpQkFDL0Q7YUFDRDtZQUNELGdCQUFnQixFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUM7WUFDakUsV0FBVyxFQUFFO2dCQUNaLFdBQVcsRUFBRSxRQUFRO2dCQUNyQixVQUFVLEVBQUUsV0FBVyxDQUFDLFNBQVM7YUFDakM7WUFDRCxnQ0FBZ0M7WUFDaEMsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztTQUM1QixDQUFDO1FBRUYsMkRBQTJEO1FBQzNELE1BQU0sWUFBWSxHQUFHLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDbkUsS0FBSyxFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUs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QyxXQUFzQjtJQUNwRCxXQUFXLENBQUMsU0FBUyxDQUNwQixTQUFTLEVBQ1QsSUFBSSxnQ0FBZSxDQUFDO1FBQ25CLDJFQUEyRTtRQUMzRSxvREFBb0Q7UUFDcEQsb0JBQW9CLEVBQUU7WUFDckI7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLGtCQUFrQixFQUFFO29CQUNuQixxREFBcUQsRUFDcEQseUZBQXlGO29CQUMxRixvREFBb0QsRUFDbkQsS0FBSztvQkFDTix5REFBeUQsRUFDeEQsU0FBUztvQkFDVixxREFBcUQsRUFDcEQsK0JBQStCO2lCQUNoQzthQUNEO1NBQ0Q7UUFDRCw2RUFBNkU7UUFDN0UsbUJBQW1CLEVBQUUsb0NBQW1CLENBQUMsS0FBSztRQUM5QyxnQkFBZ0IsRUFBRTtZQUNqQixrQkFBa0IsRUFBRSxxQkFBcUI7U0FDekM7S0FDRCxDQUFDLEVBQ0Y7UUFDQyxlQUFlLEVBQUU7WUFDaEI7Z0JBQ0MsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLGtCQUFrQixFQUFFO29CQUNuQixxREFBcUQsRUFDcEQsSUFBSTtvQkFDTCxxREFBcUQsRUFDcEQsSUFBSTtvQkFDTCx5REFBeUQsRUFDeEQsSUFBSTtvQkFDTCxvREFBb0QsRUFDbkQsSUFBSTtpQkFDTDthQUNEO1NBQ0Q7S0FDRCxDQUNELENBQUM7QUFDSCxDQUFDO0FBN0NELHdDQTZDQztBQUVELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQUksMEJBQTBCLENBQUMsR0FBRyxFQUFFLDhCQUE4QixDQUFDLENBQUM7QUFDcEUsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0SVJlc291cmNlLFxuXHRMYW1iZGFJbnRlZ3JhdGlvbixcblx0TW9ja0ludGVncmF0aW9uLFxuXHRQYXNzdGhyb3VnaEJlaGF2aW9yLFxuXHRSZXN0QXBpLFxufSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCB7IEF0dHJpYnV0ZVR5cGUsIFRhYmxlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1keW5hbW9kYlwiO1xuaW1wb3J0IHsgUnVudGltZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBBcHAsIFN0YWNrLCBSZW1vdmFsUG9saWN5IH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQge1xuXHROb2RlanNGdW5jdGlvbixcblx0Tm9kZWpzRnVuY3Rpb25Qcm9wcyxcbn0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGNsYXNzIEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrIGV4dGVuZHMgU3RhY2sge1xuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaWQ6IHN0cmluZykge1xuXHRcdHN1cGVyKGFwcCwgaWQpO1xuXG5cdFx0Y29uc3QgZHluYW1vVGFibGUgPSBuZXcgVGFibGUodGhpcywgXCJpdGVtc1wiLCB7XG5cdFx0XHRwYXJ0aXRpb25LZXk6IHtcblx0XHRcdFx0bmFtZTogXCJpdGVtSWRcIixcblx0XHRcdFx0dHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG5cdFx0XHR9LFxuXHRcdFx0dGFibGVOYW1lOiBcIml0ZW1zXCIsXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogIFRoZSBkZWZhdWx0IHJlbW92YWwgcG9saWN5IGlzIFJFVEFJTiwgd2hpY2ggbWVhbnMgdGhhdCBjZGsgZGVzdHJveSB3aWxsIG5vdCBhdHRlbXB0IHRvIGRlbGV0ZVxuXHRcdFx0ICogdGhlIG5ldyB0YWJsZSwgYW5kIGl0IHdpbGwgcmVtYWluIGluIHlvdXIgYWNjb3VudCB1bnRpbCBtYW51YWxseSBkZWxldGVkLiBCeSBzZXR0aW5nIHRoZSBwb2xpY3kgdG9cblx0XHRcdCAqIERFU1RST1ksIGNkayBkZXN0cm95IHdpbGwgZGVsZXRlIHRoZSB0YWJsZSAoZXZlbiBpZiBpdCBoYXMgZGF0YSBpbiBpdClcblx0XHRcdCAqL1xuXHRcdFx0cmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBOT1QgcmVjb21tZW5kZWQgZm9yIHByb2R1Y3Rpb24gY29kZVxuXHRcdH0pO1xuXG5cdFx0Y29uc3Qgbm9kZUpzRnVuY3Rpb25Qcm9wczogTm9kZWpzRnVuY3Rpb25Qcm9wcyA9IHtcblx0XHRcdGJ1bmRsaW5nOiB7XG5cdFx0XHRcdGV4dGVybmFsTW9kdWxlczogW1xuXHRcdFx0XHRcdFwiYXdzLXNka1wiLCAvLyBVc2UgdGhlICdhd3Mtc2RrJyBhdmFpbGFibGUgaW4gdGhlIExhbWJkYSBydW50aW1lXG5cdFx0XHRcdF0sXG5cdFx0XHR9LFxuXHRcdFx0ZGVwc0xvY2tGaWxlUGF0aDogam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiLCBcInBhY2thZ2UtbG9jay5qc29uXCIpLFxuXHRcdFx0ZW52aXJvbm1lbnQ6IHtcblx0XHRcdFx0UFJJTUFSWV9LRVk6IFwiaXRlbUlkXCIsXG5cdFx0XHRcdFRBQkxFX05BTUU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcblx0XHRcdH0sXG5cdFx0XHQvL3J1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE0X1gsw6Vcblx0XHRcdHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE4X1gsXG5cdFx0fTtcblxuXHRcdC8vIENyZWF0ZSBhIExhbWJkYSBmdW5jdGlvbiBmb3IgZWFjaCBvZiB0aGUgQ1JVRCBvcGVyYXRpb25zXG5cdFx0Y29uc3QgZ2V0T25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiZ2V0T25lSXRlbUZ1bmN0aW9uXCIsIHtcblx0XHRcdGVudHJ5OiBqb2luKF9fZGlybmFtZSwgXCJsYW1iZGFzXCIsIFwiZ2V0LW9uZS50c1wiKSxcblx0XHRcdC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG5cdFx0fSk7XG5cdFx0Y29uc3QgZ2V0QWxsTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiZ2V0QWxsSXRlbXNGdW5jdGlvblwiLCB7XG5cdFx0XHRlbnRyeTogam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiLCBcImdldC1hbGwudHNcIiksXG5cdFx0XHQuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxuXHRcdH0pO1xuXHRcdGNvbnN0IGNyZWF0ZU9uZUxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCBcImNyZWF0ZUl0ZW1GdW5jdGlvblwiLCB7XG5cdFx0XHRlbnRyeTogam9pbihfX2Rpcm5hbWUsIFwibGFtYmRhc1wiLCBcImNyZWF0ZS50c1wiKSxcblx0XHRcdC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG5cdFx0fSk7XG5cdFx0Y29uc3QgdXBkYXRlT25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwidXBkYXRlSXRlbUZ1bmN0aW9uXCIsIHtcblx0XHRcdGVudHJ5OiBqb2luKF9fZGlybmFtZSwgXCJsYW1iZGFzXCIsIFwidXBkYXRlLW9uZS50c1wiKSxcblx0XHRcdC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG5cdFx0fSk7XG5cdFx0Y29uc3QgZGVsZXRlT25lTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsIFwiZGVsZXRlSXRlbUZ1bmN0aW9uXCIsIHtcblx0XHRcdGVudHJ5OiBqb2luKF9fZGlybmFtZSwgXCJsYW1iZGFzXCIsIFwiZGVsZXRlLW9uZS50c1wiKSxcblx0XHRcdC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG5cdFx0fSk7XG5cblx0XHQvLyBHcmFudCB0aGUgTGFtYmRhIGZ1bmN0aW9uIHJlYWQgYWNjZXNzIHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxuXHRcdGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRBbGxMYW1iZGEpO1xuXHRcdGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShnZXRPbmVMYW1iZGEpO1xuXHRcdGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShjcmVhdGVPbmVMYW1iZGEpO1xuXHRcdGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh1cGRhdGVPbmVMYW1iZGEpO1xuXHRcdGR5bmFtb1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShkZWxldGVPbmVMYW1iZGEpO1xuXG5cdFx0Ly8gSW50ZWdyYXRlIHRoZSBMYW1iZGEgZnVuY3Rpb25zIHdpdGggdGhlIEFQSSBHYXRld2F5IHJlc291cmNlXG5cdFx0Y29uc3QgZ2V0QWxsSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24oZ2V0QWxsTGFtYmRhKTtcblx0XHRjb25zdCBjcmVhdGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihjcmVhdGVPbmVMYW1iZGEpO1xuXHRcdGNvbnN0IGdldE9uZUludGVncmF0aW9uID0gbmV3IExhbWJkYUludGVncmF0aW9uKGdldE9uZUxhbWJkYSk7XG5cdFx0Y29uc3QgdXBkYXRlT25lSW50ZWdyYXRpb24gPSBuZXcgTGFtYmRhSW50ZWdyYXRpb24odXBkYXRlT25lTGFtYmRhKTtcblx0XHRjb25zdCBkZWxldGVPbmVJbnRlZ3JhdGlvbiA9IG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihkZWxldGVPbmVMYW1iZGEpO1xuXG5cdFx0Ly8gQ3JlYXRlIGFuIEFQSSBHYXRld2F5IHJlc291cmNlIGZvciBlYWNoIG9mIHRoZSBDUlVEIG9wZXJhdGlvbnNcblx0XHRjb25zdCBhcGkgPSBuZXcgUmVzdEFwaSh0aGlzLCBcIml0ZW1zQXBpXCIsIHtcblx0XHRcdHJlc3RBcGlOYW1lOiBcIkl0ZW1zIFNlcnZpY2VcIixcblx0XHRcdC8vIEluIGNhc2UgeW91IHdhbnQgdG8gbWFuYWdlIGJpbmFyeSB0eXBlcywgdW5jb21tZW50IHRoZSBmb2xsb3dpbmdcblx0XHRcdC8vIGJpbmFyeU1lZGlhVHlwZXM6IFtcIiovKlwiXSxcblx0XHR9KTtcblxuXHRcdGNvbnN0IGl0ZW1zID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoXCJpdGVtc1wiKTtcblx0XHRpdGVtcy5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0QWxsSW50ZWdyYXRpb24pO1xuXHRcdGl0ZW1zLmFkZE1ldGhvZChcIlBPU1RcIiwgY3JlYXRlT25lSW50ZWdyYXRpb24pO1xuXHRcdGFkZENvcnNPcHRpb25zKGl0ZW1zKTtcblxuXHRcdGNvbnN0IHNpbmdsZUl0ZW0gPSBpdGVtcy5hZGRSZXNvdXJjZShcIntpZH1cIik7XG5cdFx0c2luZ2xlSXRlbS5hZGRNZXRob2QoXCJHRVRcIiwgZ2V0T25lSW50ZWdyYXRpb24pO1xuXHRcdHNpbmdsZUl0ZW0uYWRkTWV0aG9kKFwiUEFUQ0hcIiwgdXBkYXRlT25lSW50ZWdyYXRpb24pO1xuXHRcdHNpbmdsZUl0ZW0uYWRkTWV0aG9kKFwiREVMRVRFXCIsIGRlbGV0ZU9uZUludGVncmF0aW9uKTtcblx0XHRhZGRDb3JzT3B0aW9ucyhzaW5nbGVJdGVtKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkQ29yc09wdGlvbnMoYXBpUmVzb3VyY2U6IElSZXNvdXJjZSkge1xuXHRhcGlSZXNvdXJjZS5hZGRNZXRob2QoXG5cdFx0XCJPUFRJT05TXCIsXG5cdFx0bmV3IE1vY2tJbnRlZ3JhdGlvbih7XG5cdFx0XHQvLyBJbiBjYXNlIHlvdSB3YW50IHRvIHVzZSBiaW5hcnkgbWVkaWEgdHlwZXMsIHVuY29tbWVudCB0aGUgZm9sbG93aW5nIGxpbmVcblx0XHRcdC8vIGNvbnRlbnRIYW5kbGluZzogQ29udGVudEhhbmRsaW5nLkNPTlZFUlRfVE9fVEVYVCxcblx0XHRcdGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzdGF0dXNDb2RlOiBcIjIwMFwiLFxuXHRcdFx0XHRcdHJlc3BvbnNlUGFyYW1ldGVyczoge1xuXHRcdFx0XHRcdFx0XCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjpcblx0XHRcdFx0XHRcdFx0XCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4sWC1BbXotVXNlci1BZ2VudCdcIixcblx0XHRcdFx0XHRcdFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjpcblx0XHRcdFx0XHRcdFx0XCInKidcIixcblx0XHRcdFx0XHRcdFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiOlxuXHRcdFx0XHRcdFx0XHRcIidmYWxzZSdcIixcblx0XHRcdFx0XHRcdFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6XG5cdFx0XHRcdFx0XHRcdFwiJ09QVElPTlMsR0VULFBVVCxQT1NULERFTEVURSdcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHRcdC8vIEluIGNhc2UgeW91IHdhbnQgdG8gdXNlIGJpbmFyeSBtZWRpYSB0eXBlcywgY29tbWVudCBvdXQgdGhlIGZvbGxvd2luZyBsaW5lXG5cdFx0XHRwYXNzdGhyb3VnaEJlaGF2aW9yOiBQYXNzdGhyb3VnaEJlaGF2aW9yLk5FVkVSLFxuXHRcdFx0cmVxdWVzdFRlbXBsYXRlczoge1xuXHRcdFx0XHRcImFwcGxpY2F0aW9uL2pzb25cIjogJ3tcInN0YXR1c0NvZGVcIjogMjAwfScsXG5cdFx0XHR9LFxuXHRcdH0pLFxuXHRcdHtcblx0XHRcdG1ldGhvZFJlc3BvbnNlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3RhdHVzQ29kZTogXCIyMDBcIixcblx0XHRcdFx0XHRyZXNwb25zZVBhcmFtZXRlcnM6IHtcblx0XHRcdFx0XHRcdFwibWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6XG5cdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOlxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XCJtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCI6XG5cdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcIm1ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6XG5cdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fVxuXHQpO1xufVxuXG5jb25zdCBhcHAgPSBuZXcgQXBwKCk7XG5uZXcgQXBpTGFtYmRhQ3J1ZER5bmFtb0RCU3RhY2soYXBwLCBcIkFwaUxhbWJkYUNydWREeW5hbW9EQkV4YW1wbGVcIik7XG5hcHAuc3ludGgoKTtcbiJdfQ==