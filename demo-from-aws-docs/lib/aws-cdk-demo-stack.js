const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");

class AwsCdkDemoStack extends cdk.Stack {
	/**
	 *
	 * @param {Construct} scope
	 * @param {string} id
	 * @param {StackProps=} props
	 */
	constructor(scope, id, props) {
		super(scope, id, props);

		new s3.Bucket(this, "my-first-bucket", {
			versioned: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true
		});
	}
}

module.exports = { AwsCdkDemoStack };
