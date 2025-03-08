const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

// Configure AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE;

const create_damage_record = async (damage_record) => {
  debugger;
  try {
    const record = {
      pk: "workorder#" + damage_record.workorder_number,
      sk:
        "damage#" + damage_record.item_code + "#" + damage_record.subitem_code,
      item: damage_record.item,
      item_code: damage_record.item_code,
      subitem: damage_record.subitem,
      subitem_code: damage_record.subitem_code,
      damage: damage_record.damage,
      damage_code: damage_record.damage_code,
      severity: damage_record.severity,
      severity_code: damage_record.severity_code,
      action: damage_record.action,
      action_code: damage_record.action_code,
      charge_p_status: {
        status: "pending",
      },
      charge_l_status: {
        status: "pending",
      },
      updated: new Date().toISOString(),
    };

    const params = {
      TableName: tableName,
      Item: record,
    };

    await dynamoDB.send(new PutCommand(params));
    console.log("Damage record created successfully:", record);
    return record;
  } catch (error) {
    console.error("Error saving to DynamoDB:", error);
    throw error;
  }
};

// Test function that actually works
async function test_function() {
  console.log("Starting test...");
  try {
    // Create mock data
    const mockDamageReport = {
      workorder_number: "WO12345",
      item: "Engine",
      item_code: "ENG001",
      subitem: "Fuel Pump",
      subitem_code: "FP102",
      damage: "Corrosion",
      damage_code: "COR001",
      severity: "Moderate",
      severity_code: "MOD",
      action: "Replace",
      action_code: "REP",
    };

    console.log("Testing with mock data:", mockDamageReport);

    // Test query
    const queryParams = {
      TableName: tableName,
      IndexName: "workorder_number-index",
      KeyConditionExpression:
        "workorder_number = :workorder_number and begins_with(sk, :sk_prefix)",
      ExpressionAttributeValues: {
        ":workorder_number": mockDamageReport.workorder_number,
        ":sk_prefix": "workorder#",
      },
    };

    console.log("Running query with params:", queryParams);

    const queryResult = await dynamoDB.send(new QueryCommand(queryParams));
    console.log("Query result:", queryResult);

    const summary_record = queryResult.Items?.[0];
    console.log("Summary record:", summary_record);

    // Test create damage record
    const createdRecord = await create_damage_record(mockDamageReport);
    console.log("Create result:", createdRecord);

    console.log("Test completed successfully");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Actually execute the test function
test_function()
  .then(() => {
    console.log("Test function completed");
  })
  .catch((err) => {
    console.error("Unhandled error in test:", err);
  });
