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

configure:
	@ echo "do something"

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

###

# get-default-vpc:
# 	@ aws ec2 describe-vpcs --region $(AWS_REGION) | \
# 	      jq -r '.Vpcs[] | select(.IsDefault == true) | .VpcId'

# get-default-vpc-subnets:
# 	@ $(eval DEFAULT_VPC_ID := $(shell make get-default-vpc))
# 	@ aws ec2 describe-subnets --region $(AWS_REGION) | \
# 	      jq -r '[ .Subnets[] | select(.VpcId == "$(DEFAULT_VPC_ID)") ] | .[:2] | .[].SubnetId + ","'
