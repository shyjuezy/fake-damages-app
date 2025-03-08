const express = require("express");
const cors = require("cors");
// Replace full AWS SDK with specific modules
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.post("/api/submit", async (req, res) => {
  try {
    const {
      workorder_number,
      item,
      item_code,
      subitem,
      subitem_code,
      damage,
      damage_code,
      severity,
      severity_code,
      action,
      action_code,
    } = req.body;

    // Validate input
    if (
      !workorder_number ||
      !item ||
      !item_code ||
      !subitem ||
      !subitem_code ||
      !damage ||
      !damage_code ||
      !severity ||
      !severity_code ||
      !action ||
      !action_code
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const damageReport = {
      workorder_number,
      item,
      item_code,
      subitem,
      subitem_code,
      damage,
      damage_code,
      severity,
      severity_code,
      action,
      action_code,
    };

    const queryParams = {
      TableName: tableName,
      IndexName: "workorder_number-index",
      KeyConditionExpression:
        "workorder_number = :workorder_number and begins_with(sk, :sk_prefix)",
      ExpressionAttributeValues: {
        ":workorder_number": workorder_number,
        ":sk_prefix": "workorder#",
      },
    };

    // get data from dynamodb using index
    const queryResult = await dynamoDB.send(new QueryCommand(queryParams));
    const summary_record = queryResult.Items[0];

    console.log(summary_record);

    await create_damage_record(damageReport);

    res.status(201).json({
      message: "Damage report saved successfully",
      item: damageReport,
    });
  } catch (error) {
    console.error("Error saving to DynamoDB:", error);
    res.status(500).json({ error: "Failed to save damage report" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const create_damage_record = async (damage_record) => {
  try {
    record = {
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
    return record;
  } catch (error) {
    console.error("Error saving to DynamoDB:", error);
    throw error;
  }
};
