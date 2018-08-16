AWS_BUCKET_NAME ?= jkahn-appsync-session-manager-neptune
AWS_STACK_NAME ?= jkahn-appsync-session-manager-neptune
AWS_REGION ?= us-east-2

SAM_TEMPLATE = template.yaml
SAM_PACKAGED_TEMPLATE = packaged.yaml

create-bucket:
	@ aws s3api create-bucket \
	      --bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --create-bucket-configuration LocationConstraint=$(AWS_REGION)

package:
	@ sam package \
	      --template-file $(SAM_TEMPLATE) \
	      --s3-bucket $(AWS_BUCKET_NAME) \
	      --region $(AWS_REGION) \
	      --output-template-file $(SAM_PACKAGED_TEMPLATE)

deploy:
	@ make package
	@ sam deploy \
	      --template-file $(SAM_PACKAGED_TEMPLATE) \
	      --region $(AWS_REGION) \
	      --capabilities CAPABILITY_NAMED_IAM \
	      --stack-name $(AWS_STACK_NAME) \
	      # --force-upload

describe:
	@ aws cloudformation describe-stacks \
	      --region $(AWS_REGION) \
	      --stack-name $(AWS_STACK_NAME)

outputs:
	@ make describe \
	      | jq -r '.Stacks[0].Outputs'

cleanup:
	@ aws cloudformation delete-stack \
	      --stack-name $(AWS_STACK_NAME)
