const service = require("../service/insurance_service");

const insuranceCtrl = {
  async uploadXlsx(req, res) {
    try {
      //const url = req.body.url;

      const getData = await service.uploadXlsxData();
      const result = {
        status: true,
        statusCode: 200,
        data: getData,
        message: "Record uploaded successfully",
      };
      return res.send(result);
    } catch (ex) {
      console.log(ex);
      res.status(400);
      return res.send(ex);
    }
  },
  async uploadXlsxWorkerThread(req, res) {
    try {
      //const url = req.body.url;

      const getData = await service.uploadXlsxThreadData();
      const result = {
        status: true,
        statusCode: 200,
        data: getData,
        message: "Record uploaded successfully",
      };
      return res.send(result);
    } catch (ex) {
      console.log(ex);
      res.status(400);
      return res.send(ex);
    }
  },
  async getPolicyInfo(req, res) {
    try {
      const userId = req.params.userId;
      const result = await service.getPolicyInfo(userId);
      return res.send(result);
    } catch (ex) {
      console.log(ex);
      res.status(400);
      return res.send(ex);
    }
  },
  async getAggregatedPolicyInfo(req, res) {
    try {
      const userId = req.params.userId;
      const result = await service.getAggregatedPolicyInfo(userId);
      return res.send(result);
    } catch (ex) {
      console.log(ex);
      res.status(400);
      return res.send(ex);
    }
  },
};

module.exports = {
  uploadXlsx: insuranceCtrl.uploadXlsx,
  uploadXlsxWorkerThread: insuranceCtrl.uploadXlsxWorkerThread,
  getPolicyInfo: insuranceCtrl.getPolicyInfo,
  getAggregatedPolicyInfo: insuranceCtrl.getAggregatedPolicyInfo,
};
