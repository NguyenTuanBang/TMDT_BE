import mongoose from "mongoose";
import ProductModel from "../Model/ProductModel.js";

const commonLookups = [
  // join store
  {
    $lookup: {
      from: "stores",
      localField: "store_id",
      foreignField: "_id",
      as: "store",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1
          }
        }
      ]
    },
  },
  { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },


  // join tags
  {
    $lookup: {
      from: "producttags",
      let: { cid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product_id", "$$cid"] } } },
        {
          $lookup: {
            from: "tags",
            localField: "tag_id",
            foreignField: "_id",
            as: "tag"
          }
        },
        { $unwind: { path: "$tag", preserveNullAndEmptyArrays: true } },
      ],
      as: "producttags"
    },
  },
  {
    $lookup: {
      from: "productvariants",
      let: { pvid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$product_id", "$$pvid"] } } },
        {
          $lookup: {
            from: "images",
            localField: "image",
            foreignField: "_id",
            as: "image"
          }
        },
        {
          $lookup:{
            from: "sizes",
            localField: "size",
            foreignField: "_id",
            as: 'size'
          }
        },
        { $unwind: { path: "$image", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$size", preserveNullAndEmptyArrays: true } },
      ],
      as: "variants"
    },
  }
]


const productController = {
  getAll: async (req, res) => {
    try {
      const curPage = parseInt(req.query.curPage) || 1;
      const name = req.query.name || "";
      const query = {};


      if (name) query.name = { $regex: name, $options: "i" };
      query.status = "Đang bán"

      const itemQuantity = await ProductModel.countDocuments(query);
      const numberOfPages = Math.ceil(itemQuantity / 20);

      if (curPage > numberOfPages && numberOfPages > 0) {
        return res.status(400).send({ message: "Invalid page number" });
      }

      const data = await ProductModel.aggregate([
        { $match: query },
        ...commonLookups,
        { $skip: (curPage - 1) * 20 },
        { $limit: 20 },
      ]);

      res.status(200).send({ message: "Success", data, numberOfPages });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  getOneProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await ProductModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id), status: "Đang bán" } },
        ...commonLookups,
      ]);

      if (!data || data.length === 0) {
        return res.status(404).send({ message: "Product not found" });
      }

      res.status(200).send({ message: "Success", data: data[0] });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  getMostFavourite: async (req, res) => {
    try {
      const data = await ProductModel.aggregate([
        { $match: { status: "Đang bán" } },
        { $sort: { traded_count: -1 } },
        { $limit: 10 },
        ...commonLookups,
      ]);

      res.status(200).send({ message: "Success", data });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  getTopRating: async (req, res) => {
    try {
      const data = await ProductModel.aggregate([
        { $match: { status: "Đang bán" } },
        { $sort: { curRating: -1 } },
        { $limit: 10 },
        ...commonLookups,
      ]);

      res.status(200).send({ message: "Success", data });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  searchByName: async (req, res) => {
    try {
      const { keyword } = req.query;
      if (!keyword) return res.status(400).send({ message: "Keyword required" });

      const regex = { $regex: keyword, $options: "i" };
      const totalResults = await ProductModel.countDocuments({ name: regex });

      const data = await ProductModel.aggregate([
        { $match: { name: regex, status: "Đang bán" } },
        { $limit: 5 },
        ...commonLookups,
        { $addFields: { mainImage: { $first: "$variants.image" } } },
        { $project: { name: 1, mainImage: 1 } },
      ]);

      if (data.length === 0) {
        return res.status(200).send({ message: "Not Found", data: [] });
      }

      res.status(200).send({ message: "Success", data, totalResults });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  getByPriceRange: async (req, res) => {
    try {
      const { min, max } = req.query;
      const curPage = parseInt(req.query.curPage) || 1;
      const rangeQuery = {
        base_price: {
          $gte: parseFloat(min) || 0,
          $lte: parseFloat(max) || Number.MAX_SAFE_INTEGER,
        },
      };

      const itemQuantity = await ProductModel.countDocuments(rangeQuery);
      const numberOfPages = Math.ceil(itemQuantity / 20);

      const data = await ProductModel.aggregate([
        { $match: { ...rangeQuery, status: "Đang bán" } },
        ...commonLookups,
        { $skip: (curPage - 1) * 20 },
        { $limit: 20 },
      ]);

      res.status(200).send({ message: "Success", data, numberOfPages });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },

  getByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const curPage = parseInt(req.query.curPage) || 1;

      const itemQuantity = await ProductModel.countDocuments({
        store_id: new mongoose.Types.ObjectId(storeId),
      });
      const numberOfPages = Math.ceil(itemQuantity / 20);

      const data = await ProductModel.aggregate([
        { $match: { store_id: new mongoose.Types.ObjectId(storeId), status: "Đang bán" } },
        ...commonLookups,
        { $skip: (curPage - 1) * 20 },
        { $limit: 20 },
      ]);

      res.status(200).send({ message: "Success", data, numberOfPages });
    } catch (error) {
      res.status(500).send({ message: "Error", error: error.message });
    }
  },
};

export default productController;
