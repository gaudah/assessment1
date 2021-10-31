module.exports = {
  createOrUpdateRecord: async (model, condition, params) => {
    try {
      const result = await model.findOneAndUpdate(condition, params, {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      });
      //console.log(" result :", result);
      return {
        status: true,
        statusCode: 200,
        data: result && result["value"] ? result["value"] : {},
        message: "Record updated successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  createBulkRecords: async (model, listOfObj) => {
    try {
      const result = await model.insertMany(listOfObj);

      return {
        status: true,
        statusCode: 200,
        data: result,
        message: "Record created successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  createRecord: async (model, condition, params) => {
    try {
      const rec = await model.find(condition);

      if (rec && rec.length > 0) {
        throw new Error((message = "Record already exist"));
      }
      //console.log(" condition and params :", condition, params)
      const result = await model.findOneAndUpdate(condition, params, {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      });

      return {
        status: true,
        statusCode: 200,
        data: result && result["value"] ? result["value"] : {},
        message: "Record created successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name || "Error",
        message: err.message,
      };
    }
  },

  getRecordByCondition: async (model, condition, selectFields) => {
    try {
      const result = await model.find(condition, selectFields);

      if (result && result.length === 0) {
        throw new Error((message = "Record does not exist"));
      }

      return {
        status: true,
        statusCode: 200,
        data: result,
        message: "Record fetched successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  getDistinctRecordByCondition: async (model, condition, selectFields) => {
    try {
      const result = await model.distinct(selectFields, condition);

      return {
        status: true,
        statusCode: 200,
        data: result || [],
        message: "Record fetched successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },
  getRecordCountByCondition: async (model, condition) => {
    try {
      const result = await model.count(condition);

      return {
        status: true,
        statusCode: 200,
        data: result || 0,
        message: "Record fetched successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },
  getAggregatedRecordsByCondition: async (model, condition) => {
    try {
      //console.log(" condition :", condition);
      const result = await model.aggregate(condition);
      console.log(" RESULt :", JSON.stringify(result));
      if (result && result.length === 0) {
        throw new Error((message = "Record does not exist"));
      }

      return {
        status: true,
        statusCode: 200,
        data: result,
        message: "Record fetched successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  getRecordsWithPagination: async (
    model,
    query,
    whereCondition,
    selectFields
  ) => {
    try {
      let size = 10;
      let offset = 0;
      let page = 0;

      size = query["size"] ? parseInt(query["size"]) : 10;
      page = query["page"] ? parseInt(query["page"]) : 0;
      offset = size * page;

      let sort = {};

      if (query["sort"]) sort[query["sort"]] = -1;
      else sort["created_at"] = -1;

      let length = await model.find(whereCondition).countDocuments();

      if (length !== 0) {
        let list = await model
          .find(whereCondition, selectFields)
          .skip(offset)
          .limit(size)
          .sort(sort);

        let obj = {};
        obj["list"] = list;
        obj["count"] = length;

        return {
          status: true,
          statusCode: 200,
          data: obj,
          message: "Record fetched successfully",
        };
      } else {
        return {
          status: true,
          statusCode: 200,
          data: {},
          message: "Record fetched successfully",
        };
      }
    } catch (err) {
      return {
        status: false,
        statusCode: 500,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  getAggregatedRecordsWithPagination: async (
    model,
    query,
    whereCondition,
    groupByCondition,
    lookupCondition,
    unwindFields,
    selectFields
  ) => {
    try {
      let size = 10;
      let offset = 0;
      let page = 0;

      size = query["size"] ? parseInt(query["size"]) : 10;
      page = query["page"] ? parseInt(query["page"]) : 0;
      offset = size * page;

      let sort = {};

      if (query["sort"]) sort[query["sort"]] = -1;
      else sort["created_at"] = -1;

      let length = await model.find(whereCondition).countDocuments();

      if (length !== 0) {
        //let aggregateCondition = [{ $match: whereCondition }, { $sort : sort },  { $skip : offset }, { $limit : size }, {$group : { _id : "$doc_type", docs: { $push: "$$ROOT" } }}]
        let aggregateCondition = [
          { $match: whereCondition },
          { $sort: sort },
          { $skip: offset },
          { $limit: size },
        ];
        if (groupByCondition) aggregateCondition.push(groupByCondition);
        if (lookupCondition) aggregateCondition.push(lookupCondition);
        if (unwindFields) aggregateCondition.push(unwindFields);
        if (selectFields) aggregateCondition.push(selectFields);
        //console.log("aggregateCondition :", aggregateCondition)
        let list = await model.aggregate(aggregateCondition);

        let obj = {};
        obj["list"] = list;
        obj["count"] = length;

        return {
          status: true,
          statusCode: 200,
          data: obj,
          message: "Record fetched successfully",
        };
      } else {
        return {
          status: true,
          statusCode: 200,
          data: {},
          message: "Record fetched successfully",
        };
      }
    } catch (err) {
      return {
        status: false,
        statusCode: 500,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  getRecordsByAggregatedQueryAndPagination: async (
    model,
    query,
    aggregateCondition
  ) => {
    try {
      let size = 10;
      let offset = 0;
      let page = 0;

      size = query["size"] ? parseInt(query["size"]) : 10;
      page = query["page"] ? parseInt(query["page"]) : 0;
      offset = size * page;

      let sort = {};

      if (query["sort"]) sort[query["sort"]] = -1;
      else sort["created_at"] = -1;

      let totalAggregatedRecordsCntCond = JSON.parse(
        JSON.stringify(aggregateCondition)
      );
      let totalAggregatedRecordsCond = JSON.parse(
        JSON.stringify(aggregateCondition)
      );

      totalAggregatedRecordsCntCond.push({
        $group: { _id: null, total_records_by_aggregated_query: { $sum: 1 } },
      });
      totalAggregatedRecordsCntCond.push({
        $project: { _id: 0, total_records_by_aggregated_query: 1 },
      });

      let length = await model.aggregate(totalAggregatedRecordsCntCond);

      if (
        length &&
        length[0] &&
        length[0]["total_records_by_aggregated_query"] !== 0
      ) {
        totalAggregatedRecordsCond.push({ $sort: sort });
        totalAggregatedRecordsCond.push({ $skip: offset });
        totalAggregatedRecordsCond.push({ $limit: size });

        let list = await model.aggregate(totalAggregatedRecordsCond);

        let obj = {};
        obj["list"] = list;
        obj["count"] = length[0]["total_records_by_aggregated_query"];

        return {
          status: true,
          statusCode: 200,
          data: obj,
          message: "Record fetched successfully",
        };
      } else {
        return {
          status: true,
          statusCode: 200,
          data: {},
          message: "Record fetched successfully",
        };
      }
    } catch (err) {
      return {
        status: false,
        statusCode: 500,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  updateRecord: async (model, condition, params) => {
    try {
      const rec = await model.find(condition);

      if (rec && rec.length === 0) {
        throw new Error((message = "Record does not exist"));
      }
      //console.log("updateRecord : ", condition ,params)
      const result = await model.findOneAndUpdate(condition, params, {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
      });

      return {
        status: true,
        statusCode: 200,
        data: result && result["value"] ? result["value"] : {},
        message: "Record updated successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },

  deleteRecord: async (model, condition) => {
    try {
      const rec = await model.find(condition);
      if (rec && rec.length === 0) {
        throw new Error((message = "Record does not exist"));
      }

      const result = await model.remove(condition);

      return {
        status: true,
        statusCode: 200,
        data: result,
        message: "Record removed successfully",
      };
    } catch (err) {
      return {
        status: false,
        statusCode: 409,
        data: {},
        name: err.name,
        message: err.message,
      };
    }
  },
};
