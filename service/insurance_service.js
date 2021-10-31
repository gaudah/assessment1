const dbInterface = require("../interface/db-interface");
const { accountModel } = require("../models/account");
const { agentModel } = require("../models/agent");
const { policyCarrierModel } = require("../models/policy_carrier");
const { policyCategoryModel } = require("../models/policy_category");
const { policyInfoModel } = require("../models/policy_info");
const { userModel } = require("../models/user");
const ObjectId = require("mongodb").ObjectID;
const { Worker } = require("worker_threads");
// Requiring module
const reader = require("xlsx");

const insuranceService = {
  async uploadXlsxData() {
    try {
      // Reading our test file
      const file = reader.readFile("./data-sheet.xlsx");

      let data = [];

      const sheets = file.SheetNames;

      for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[i]]
        );
        temp.forEach((res) => {
          data.push(res);
        });
      }

      // Printing data
      //console.log("XLSX DATA :", data);

      data.forEach(async (item) => {
        const agentData = { agent_name: item.agent };
        const accountData = {
          account_type: item.account_type,
          account_name: item.account_name,
        };
        const policyCarrierData = {
          company_name: item.company_name,
        };
        const policyCategoryData = {
          category_name: item.category_name,
        };
        const userData = {
          user_type: item.userType,
          first_name: item.firstname,
          date_of_birth: item.dob,
          address: item.address,
          contact_number: item.phone,
          city: item.city,
          state: item.state,
          zip_code: item.zip,
          email: item.email,
          gender: item.gender || "",
        };
        const policyInfoData = {
          policy_mode: item.policy_mode,
          producer: item.producer,
          policy_number: item.policy_number,
          premium_amount: item.premium_amount,
          policy_type: item.policy_type,
          //company_collection_id: item.company_collection_id,
          //policy_category: item.policy_category,
          policy_start_date: item.policy_start_date,
          policy_end_date: item.policy_end_date,
          csr: item.csr,
          //account_id: item.account_id,
          primary: item.primary,
          //user_id: item.user_id,
          //collection_id: item.collection_id,
          has_active_client_id: item.has_active_client_id,
        };

        const [
          agentCreate,
          accountCreate,
          policyCarrierCreate,
          policyCategoryCreate,
          userDataCreate,
        ] = await Promise.all([
          dbInterface.createOrUpdateRecord(agentModel, agentData, agentData),
          dbInterface.createOrUpdateRecord(
            accountModel,
            accountData,
            accountData
          ),
          dbInterface.createOrUpdateRecord(
            policyCarrierModel,
            policyCarrierData,
            policyCarrierData
          ),
          dbInterface.createOrUpdateRecord(
            policyCategoryModel,
            policyCategoryData,
            policyCategoryData
          ),
          dbInterface.createOrUpdateRecord(
            userModel,
            { contact_number: item.phone },
            userData
          ),
        ]);

        console.log(`First call: `, agentCreate);
        console.log(`Second call: `, accountCreate);
        console.log(`Third call: `, policyCarrierCreate);
        console.log(`Fourth call: `, policyCategoryCreate);
        console.log(`Fifth call: `, userDataCreate);

        policyInfoData.company_collection_id = policyCarrierCreate.data._id;
        policyInfoData.policy_category = policyCategoryCreate.data._id;
        policyInfoData.account_id = accountCreate.data._id;
        policyInfoData.user_id = userDataCreate.data._id;
        policyInfoData.collection_id = agentCreate.data._id;

        console.log(" policyInfoData $$%$%$%$% :", policyInfoData);
        const policyDataCreate = await dbInterface.createOrUpdateRecord(
          policyInfoModel,
          { policy_number: item.policy_number },
          policyInfoData
        );
        //console.log(" policyDataCreate :", policyDataCreate);
      });

      return data;
    } catch (ex) {
      console.log(ex);
      throw { error: ex };
    }
  },
  async uploadXlsxThreadData() {
    return new Promise((resolve, reject) => {
      try {
        const file = "./data-sheet.xlsx";

        const worker = new Worker("./service/thread/worker.js", {
          workerData: { fileName: file },
        });

        worker.once("message", (result) => {
          console.log(`Uploaded result :`, result);
          resolve(result);
        });

        worker.on("error", (error) => {
          console.log(error);
          reject({ error: error });
        });

        worker.on("exit", (exitCode) => {
          console.log(`It exited with code ${exitCode}`);
          reject({ error: exitCode });
        });

        console.log("Execution in main thread");

        //return { message: "Excel sheet uploaded successfully" };
      } catch (ex) {
        console.log(ex);
        reject({ error: ex });
        //throw { error: ex };
      }
    });
  },
  async getPolicyInfo(userId) {
    try {
      const policyDataCreate = await dbInterface.getRecordByCondition(
        policyInfoModel,
        { userId: userId },
        {}
      );

      return policyDataCreate;
    } catch (ex) {
      console.log(ex);
      throw { error: ex };
    }
  },
  async getAggregatedPolicyInfo(userId) {
    try {
      const aggregatedQuery = [
        { $match: { _id: ObjectId(userId) } },
        {
          $lookup: {
            from: "policy_infos",
            localField: "_id",
            foreignField: "user_id",
            as: "policy_info",
          },
        },
        { $unwind: "$policy_info" },
        {
          $lookup: {
            from: "accounts",
            let: { account_id: "$policy_info.account_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$account_id"] },
                },
              },
            ],
            as: "accountInfo",
          },
        },
        {
          $lookup: {
            from: "policy_categories",
            let: { policy_category_id: "$policy_info.policy_category" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$policy_category_id"] },
                },
              },
            ],
            as: "policyCategoryInfo",
          },
        },
        {
          $lookup: {
            from: "agents",
            let: { collection_id: "$policy_info.collection_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$collection_id"] },
                },
              },
            ],
            as: "agentInfo",
          },
        },
        {
          $lookup: {
            from: "policy_carriers",
            let: {
              company_collection_id: "$policy_info.company_collection_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$company_collection_id"] },
                },
              },
            ],
            as: "policyCarrierInfo",
          },
        },
        {
          $addFields: {
            accountDetails: {
              $mergeObjects: [
                { $arrayElemAt: ["$accountInfo", 0] },
                "$policy_info",
              ],
            },
            policyCategoryDetails: {
              $mergeObjects: [
                { $arrayElemAt: ["$policyCategoryInfo", 0] },
                "$policy_info",
              ],
            },
            agentDetails: {
              $mergeObjects: [
                { $arrayElemAt: ["$agentInfo", 0] },
                "$policy_info",
              ],
            },
            policyCarrierDetails: {
              $mergeObjects: [
                { $arrayElemAt: ["$policyCarrierInfo", 0] },
                "$policy_info",
              ],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            userId: { $first: "$_id" },
            contact_number: { $first: "$contact_number" },
            address: { $first: "$address" },
            city: { $first: "$city" },
            date_of_birth: { $first: "$date_of_birth" },
            email: { $first: "$email" },
            first_name: { $first: "$first_name" },
            gender: { $first: "$gender" },
            state: { $first: "$state" },
            user_type: { $first: "$user_type" },
            zip_code: { $first: "$zip_code" },
            policy_details: {
              $push: "$accountDetails",
              $push: "$policyCategoryDetails",
              $push: "$agentDetails",
              $push: "$policyCarrierDetails",
            },
          },
        },
      ];
      //console.log(" aggregatedQuery :", JSON.stringify(aggregatedQuery));
      const getAggregatedQueryDetails = await dbInterface.getAggregatedRecordsByCondition(
        userModel,
        aggregatedQuery
      );

      return getAggregatedQueryDetails;
    } catch (ex) {
      console.log(ex);
      throw { error: ex };
    }
  },
};

module.exports = {
  uploadXlsxData: insuranceService.uploadXlsxData,
  uploadXlsxThreadData: insuranceService.uploadXlsxThreadData,
  getPolicyInfo: insuranceService.getPolicyInfo,
  getAggregatedPolicyInfo: insuranceService.getAggregatedPolicyInfo,
};
