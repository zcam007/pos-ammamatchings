"use-strict";

const model = require("../Models/order"),
  response = require("../Helpers/response"),
  { pagination } = require("../Models/page"),
  { getProductById } = require("../Models/product");

exports.getOrders = (req, res) => {
  const page = pagination(req);
  model
    .getOrders(req, page)
    .then(result => {
      response.success(res, result);
    })
    .catch(err => {
      response.error(res, err);
    });
};

exports.newOrder = async (req, res) => {
  // console.log(req.body, "uye");
  if (req.body.admin_id == null)
    return response.error(res, {"message":"Admin id can't be empty"});
  if (req.body.total_price == null)
    return response.error(res, {"message":"Total price can't be empty"});
  if (req.body.detail_order == null)
    return response.error(res, {"message":"Detail order can't be empty"});
  if (!Array.isArray(req.body.detail_order))
    return response.error(res,{ "message":"Detail order must be array of object"});

  const detailOrder = req.body.detail_order;
  const orderProdId = detailOrder.map(item => item.prod_id);

  for (order in detailOrder) {
    const product = await getProductById(req, detailOrder[order].prod_id);
    if (product.length === 0)
      return response.error(
        res,
        `Product id ${detailOrder[order].prod_id} not found`
      );
    if (product[0].quantity < detailOrder[order].quantity)
      return response.error(
        res,
        {"message":`Quantity product id ${detailOrder[order].prod_id} not enough`}
      );
  }
  let orderIdFromGenerator=orderGenerator();
  model
    .newOrder(req, orderIdFromGenerator)
    .then(resultOrder => {
      let status = [];
      detailOrder.forEach(async item => {
        await model
          .reduceQtyProduct(detailOrder)
          .then(result => status.push(true))
          .catch(err => status.push(false));
      });
      console.log(resultOrder)
      if (status.includes(false))
        return response.error(res, {"message":"Failed to create new order"});
      else {
        
        response.success(res, {"message":"Success create new order","order_id":orderIdFromGenerator});
      
      }
    })
    .catch(err => {
      if (err.code == "ER_DUP_ENTRY") this.newOrder(req, res);
      else response.error(res, err.code);
    });
};

exports.getDetailOrderById = (req, res) => {
  model
    .getOrderById(req)
    .then(result => {
      if (result.length != 0) {
        model
          .getDetailOrderById(req.params.order_id)
          .then(resultDetail => {
            const data = result.map(item => ({
              admin_id: item.admin_id,
              order_id: item.order_id,
              detail_order: resultDetail,
              total_price: item.total_price,
              status: item.status,
              cancel_reason: item.cancel_reason,
              created_at: item.created_at,
              update_at: item.update_at
            }));

            response.success(res, data[0]);
          })
          .catch(err => {
            response.error(res, err);
          });
      } else {
        response.error(res, {"message":"Order Not Found"});
      }
    })
    .catch(err => response.error(res, err));
};

exports.updateStatusOrder = (req, res) => {
  if (req.body.status == null)
    return response.error(res, {"message":"Status can't be empty"});

  if (req.body.status == "cancel") {
    if (req.body.cancel_reason == null) {
      return response.error(res,{ "message":"Cancel reason can't be empty"});
    }
  }

  model
    .updateStatusOrder(req)
    .then(result => {
      model
        .getDetailOrderById(req.params.order_id)
        .then(result => {
          const data = result.map(item => ({
            prod_id: item.prod_id,
            quantity: item.quantity
          }));

          model
            .updateQtyProduct(data, req.body.status)
            .then(result => {
              response.success(res, `Order updated to '${req.body.status}'`);
            })
            .catch(err => {
              response.error(res, err);
            });
        })
        .catch(err => {
          response.error(res, err.sqlMessage);
        });
        // response.success(res,result)
    })
    .catch(err => {
      // console.log("asd")

      response.error(res, err.sqlMessage);
    });
};

const orderGenerator = () => {
  return Math.floor(Math.random() * 990000) + 100000;
};
