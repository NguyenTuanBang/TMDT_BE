import User from "../Model/UserModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Address from "../Model/AddressModel.js";

const getMe = catchAsync(async (req, res, next) => {
  try{
    const user = await User.findById(req.user.id).select("-password");
  
    res.status(200).send({
      status: "success",
      data: {
        user,
      },
    });
  }catch(err){  
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
});

const updateMe = catchAsync(async (req, res, next) => {
  try{

    const allowedFields = ["fullname", "phone"];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field]) updateData[field] = req.body[field];
    });
  
    if (req.file) {
      updateData.avatar = req.file.filename;
    }
  
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
  
    res.status(200).send({
      status: "success",
      data: { user: updatedUser },
    });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
});

const getAddresses = catchAsync(async (req, res, next) => {
  try{
    const addresses = await Address.find({ user: req.user.id }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.status(200).send({
    status: "success",
    results: addresses.length,
    data: addresses,
  });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
  
});

const addAddress = catchAsync(async (req, res, next) => {
  try{
    const { name, phone, province, district, ward, detail } = req.body;
  const count = await Address.countDocuments({ user: req.user.id });
  const address = await Address.create({
    user: req.user.id,
    name,
    phone,
    province,
    district,
    ward,
    detail,
    isDefault: count === 0,
  });

  res.status(201).send({
    status: "success",
    data: {
      address,
    },
  });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
  
});

const setAddressDefault = catchAsync(async (req, res, next) => {
  try{

    const { id } = req.params;
  
    const address = await Address.findOne({ _id: id, user: req.user.id });
  
    if (!address) {
      return next(new AppError("Không tìm thấy địa chỉ này", 404));
    }
  
    await Address.updateMany(
      { user: req.user.id, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );
  
    address.isDefault = true;
    await address.save();
  
    res.status(200).send({
      status: "success",
      data: { address },
    });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
});

const deleteAddress = catchAsync(async (req, res, next) => {
  try{
    const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!address) {
    return next(new AppError("Không tìm thấy địa chỉ này", 404));
  }

  res.status(204).send({
    status: "success",
    data: null,
  });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
  
});

const updateAddress = catchAsync(async (req, res, next) => {
  try{
    const { id } = req.params;
    const { name, phone, province, district, ward, detail } = req.body;
  
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { name, phone, province, district, ward, detail },
      {
        new: true,
        runValidators: true,
      }
    );
  
    if (!address) {
      return next(new AppError("Không tìm thấy địa chỉ này", 404));
    }
  
    res.status(200).send({
      status: "success",
      data: { address },
    });
  }catch(err){
    return res.status(400).send({
      status: "fail",
      message: err.message,
    });
  }
});

const userController = {
  getMe,
  updateMe,
  getAddresses,
  addAddress,
  setAddressDefault,
  deleteAddress,
  updateAddress,
};
export default userController;