"use-strict";

const model = require("../Models/user"),
  response = require("../Helpers/response"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  secretKey = process.env.SECRET_KEY || "270400",
  { pagination } = require("../Models/page");

exports.registerUser = (req, res) => {
  if (req.body.username === null || req.body.username === "")
    return response.error(res, {"message":"Username can't be empty"});
  if (!isUsernameValid(req.body.username))
    return response.error(
      res,
      {"message":"username cannot contain special character except underscore ( _ ) and minimal 6 digits"}
    );
  if (req.body.password === null || req.body.password === "")
    return response.error(res, {"message":"Password can't be empty"});
  if (!isPasswordValid(req.body.password))
    return response.error(
      res,
      {"message":"Password must have lower case, upper case, number, and minimal 8 digits"}
    );
  if (req.body.user_role === null || req.body.user_role === "")
    return response.error(res, {"message":"User role can't be empty"});

  model
    .getUserByName(req)
    .then((result) => {
      if (result.length != 0)
        return response.error(
          res,
          {"message":"Username has been taken, please change your username"}
        );
      model
        .registerUser(req)
        .then((result) => {
          response.success(res, {"message":"User created successfully"});
        })
        .catch((err) => {
          response.error(res, err);
        });
    })
    .catch((err) => response.error(res, err));
};

const updateValidations =(req,res)=>{
  if (req.body.password === null || req.body.password === "")
    return response.error(res, {"message":"Password can't be empty"});
  if (!isPasswordValid(req.body.password))
    return response.error(
      res,
      {"message":"Password must have lower case, upper case, number, and minimal 8 digits"}
    );
  if (req.body.user_role === null || req.body.user_role === "")
    return response.error(res, {"message":"User role can't be empty"});

}

const isPasswordValid = (password) => {
  const tester = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  return password.match(tester) == null ? false : true;
};

const isUsernameValid = (username) => {
  const tester = /[_]*(?!.*\W).{6,}/;
  return username.match(tester) == null ? false : true;
};

exports.loginUser = (req, res) => {
  if (req.body.username == null || req.body.username === "")
    return response.error(res, {"message":"Username can't be empty"});
  if (!isUsernameValid(req.body.username))
    return response.error(
      res,
      {"message":"username cannot contain special character except underscore ( _ ) and minimal 6 digits"}
    );
  if (req.body.password == null || req.body.password === "")
    return response.error(res, {"message":"Password can't be empty"});
  if (!isPasswordValid(req.body.password))
    return response.error(
      res,
      {"message":"Password must have lower case, upper case, number, and minimal 8 digits"}
    );

  model.loginUser(req).then((result) => {
    if (result.length != 0) {
      if (bcrypt.compareSync(req.body.password, result[0].password)) {
        const token = jwt.sign(
          {
            id: result[0].id,
            username: result[0].username,
          },
          secretKey,
          {
            expiresIn: "1d",
          }
        );
        const { id, password, ...userData } = result[0];
        response.success(res, {
          ...userData,
          user_id: id,
          token: token,
        });
      } else {
        response.error(res, {"message":"Password incorrect"});
      }
    } else {
      response.error(res, {"message":"User not found"});
    }
  });
};

exports.updateUser = (req, res) => {
  model
    .getUserById(req)
    .then((result) => {
      if (result.length == 0) return response.error(res, {"message":"User not found"});
      updateValidations(req,res)
      model
        .updateUser(req)
        .then((result) => {
          response.success(res, {"message":"Updated user successfully"});
        })
        .catch((err) => {
          response.error(res, err);
        });
    })
    .catch((err) => response.error(res, err));
};

exports.getUserList = (req, res) => {
  const page = pagination(req);
  model
    .getUserList(req, page)
    .then((result) => response.success(res, result))
    .catch((err) => response.error(res, err));
};

exports.getUserById = (req, res) => {
  model
    .getUserById(req)
    .then((result) => {
      if (result.length == 0) return response.error(res, {"message":"User not found"});  
      response.success(res, result[0]);
    })
    .catch((err) => response.error(res, err));
};

exports.deleteUser = (req, res) => {
  model
    .deleteUser(req)
    .then((result) => {
      response.success(res, {"message":"User deleted successfully"});
    })
    .catch((err) => result.error(res, err));
};

exports.logoutUser = (req, res) => {
response.success(res,{"message":"Logged out succesfully"})

}

