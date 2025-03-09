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
      work_order_number,
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
      site_id,
    } = req.body;

    // Validate input
    if (
      !work_order_number ||
      !item ||
      !item_code ||
      !subitem ||
      !subitem_code ||
      !damage ||
      !damage_code ||
      !severity ||
      !severity_code ||
      !action ||
      !action_code ||
      !site_id
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const damageReport = {
      work_order_number,
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
      site_id,
    };

    const queryParams = {
      TableName: tableName,
      IndexName: "index_work_order_number",
      KeyConditionExpression:
        "work_order_number = :work_order_number and begins_with(sk, :sk_prefix)",
      ExpressionAttributeValues: {
        ":work_order_number": work_order_number,
        ":sk_prefix": "workorder:",
      },
    };

    // get data from dynamodb using index
    const queryResult = await dynamoDB.send(new QueryCommand(queryParams));
    const summary_record = queryResult.Items[0];
    damageReport.sblu = summary_record.sblu;

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
      pk: `workorder:${damage_record.sblu}#${damage_record.site_id}`,
      sk: `damage:${damage_record.item_code}#${damage_record.subitem_code}#${damage_record.damage_code}#${damage_record.severity_code}#${damage_record.action_code}`,
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
      approved: true,
      category: "Mechanical",
      charge_p_status: {
        ecrvcf_status: "PN",
        shop_code: "MECH",
        translated_status: "PART NEEDED",
      },
      charge_l_status: {
        ecrvcf_status: "M",
        shop_code: "MECH",
        translated_status: "READY FOR REPAIR",
      },
      entity_type: "damage",
      site_id: damage_record.site_id,
      source: "ECRVCF",
      sblu: damage_record.sblu,
      updated: Math.floor(new Date().getTime() / 1000),
      updated_by: "faker",
      vin: "12345678901234567",
      work_order_number: damage_record.work_order_number,
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
