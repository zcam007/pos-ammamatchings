'use-strict';

const conn = require('../Configs/conn'),
    { getMaxPage } = require('./page');

const sortBy = (req, sql) => {
        const sortBy = req.query.sortby;
        const orderBy = req.query.orderby;
        const dateCreated=req.query.created_at;
        const status=req.query.status;
        if(dateCreated!=null){
            if(status!=null)
            sql+=`where created_at LIKE '${dateCreated}%' AND status='${status}' `;
            else{
                sql+=`where created_at LIKE '${dateCreated}%'`;
            }
        }
        else if(status!=null){
            sql+=`where status='${status}' `;
        }
        if (sortBy == "created") {
          sql += `ORDER BY created_at `;
        } 
        if (sortBy != null) {
          if (orderBy == "asc" || orderBy == null) {
            sql += "ASC";
          } else if ("desc") {
            sql += "DESC";
          }
        }
        return sql;
      };

exports.getOrders = (req, page) => {
    let sql = 'SELECT * FROM tb_orders ';
    sql = sortBy(req, sql);
    return new Promise((resolve, reject) => {
        getMaxPage(page, null, "tb_orders").then(maxPage => {
            const infoPage = {
                currentPage: page.page,
                totalAllOrder: maxPage.totalProduct,
                maxPage: maxPage.maxPage
            };

            conn.query(`${sql} LIMIT ? OFFSET ?`, [page.limit, page.offset], (err, data) => {
                if (!err) resolve({
                    infoPage,
                    data
                });
                else reject(err);
            });
        }).catch(err => reject(err));
    });
}

exports.newOrder = async (req, order) => {
    return new Promise((resolve, reject) => {
            let price=parseFloat(req.body.total_price).toFixed(2);
        conn.query('INSERT INTO tb_orders SET admin_id = ?, order_id = ?, total_price = ?',
            [req.body.admin_id, order, price],
            (err, result) => {
                if (!err) {
                    const values = req.body.detail_order.map(item => [order, item.prod_id, item.quantity, parseFloat(item.sub_total).toFixed(2)]);
                    conn.query('INSERT INTO tb_orders_detail (order_id, prod_id, quantity, sub_total) VALUES ? ',
                        [values],
                        (err, result) => {
                            if (!err) resolve(result);
                            else reject(err);
                        }
                    );
                } else reject(err);
            });
    });
}

exports.updateStatusOrder = req => {
    const body = req.body;
    return new Promise((resolve, reject) => {
        conn.query('UPDATE tb_orders SET status = ?, cancel_reason = ? WHERE order_id = ?', [body.status, body.cancel_reason, req.params.order_id],
            (err, result) => {
                if (!err) resolve(result)
                else reject(err);
            });
    });
}

exports.updateQtyProduct = (product, status) => {
    let sql = '';
    const operator = status == 'success' ? '-' : '+';
    console.log(product);
    
    product.forEach((item, index) => {
        sql += `UPDATE tb_products SET quantity = quantity ${operator} ${item.quantity} WHERE id = ${item.prod_id};`;
    });

    return new Promise((resolve, reject) => {
        conn.query(sql, product, (err, result) => {
            if (!err) resolve(result);
            else reject(err);
        });
    });

}

exports.reduceQtyProduct = (product) => {
    return new Promise((resolve, reject) => {
        conn.query(`UPDATE tb_products SET quantity = quantity - ? WHERE id = ?`, [product.quantity, product.prod_id], (err, result) => {
            if(!err) resolve(result);
            else reject(err);
        })
    })
}

exports.getOrderById = (req, order) => {
    const orderId = req.params.order_id || req.body.order_id || order;
    return new Promise((resolve, reject) => {
        conn.query(`SELECT * FROM tb_orders WHERE order_id = ?`, [orderId],
            (err, result) => {
                if (!err) resolve(result);
                else reject(err);
            })
    });
}

exports.getDetailOrderById = orderId => {
    return new Promise((resolve, reject) => {
        conn.query(`SELECT product.name, do.prod_id, do.quantity, do.sub_total FROM tb_orders_detail as do, tb_products as product WHERE do.order_id = ? AND do.prod_id=product.id`, [orderId],
            (err, result) => {
                if (!err) resolve(result);
                else reject(err);
            });
    })
}