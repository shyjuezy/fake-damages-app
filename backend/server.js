const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE;

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.post("/api/submit", async (req, res) => {
  try {
    const { item, subitem, damage, severity, action } = req.body;

    // Validate input
    if (!item || !subitem || !damage || !severity || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const damageReport = {
      id: uuidv4(),
      item,
      subitem,
      damage,
      severity,
      action,
      createdAt: new Date().toISOString(),
    };

    const params = {
      TableName: tableName,
      Item: damageReport,
    };

    await dynamoDB.put(params).promise();

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
