//add this script in myWorker.js file
const { parentPort, workerData } = require("worker_threads");
require("../../src/database");
const dbInterface = require("../../interface/db-interface");
const { accountModel } = require("../../models/account");
const { agentModel } = require("../../models/agent");
const { policyCarrierModel } = require("../../models/policy_carrier");
const { policyCategoryModel } = require("../../models/policy_category");
const { policyInfoModel } = require("../../models/policy_info");
const { userModel } = require("../../models/user");

// Requiring module
const reader = require("xlsx");

const uploadData = (fileName) => {
  // Reading our test file
  const file = reader.readFile(fileName);

  let data = [];

  const sheets = file.SheetNames;

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
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
    //console.log(" policyInfoData: ", policyInfoData);

    const [
      agentCreate,
      accountCreate,
      policyCarrierCreate,
      policyCategoryCreate,
      userDataCreate,
    ] = await Promise.all([
      dbInterface.createOrUpdateRecord(agentModel, agentData, agentData),
      dbInterface.createOrUpdateRecord(accountModel, accountData, accountData),
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

    /*console.log(`First call: `, agentCreate);
    console.log(`Second call: `, accountCreate);
    console.log(`Third call: `, policyCarrierCreate);
    console.log(`Fourth call: `, policyCategoryCreate);
    console.log(`Fifth call: `, userDataCreate);*/

    policyInfoData.company_collection_id = policyCarrierCreate.data._id;
    policyInfoData.policy_category = policyCategoryCreate.data._id;
    policyInfoData.account_id = accountCreate.data._id;
    policyInfoData.user_id = userDataCreate.data._id;
    policyInfoData.collection_id = agentCreate.data._id;

    //console.log(" policyInfoData $$%$%$%$% :", policyInfoData);
    const policyDataCreate = await dbInterface.createOrUpdateRecord(
      policyInfoModel,
      { policy_number: item.policy_number },
      policyInfoData
    );
    //console.log(" policyDataCreate :", policyDataCreate);
  });
  return data;
};

parentPort.postMessage(uploadData(workerData.fileName));
