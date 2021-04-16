'use-strict';

exports.success = (res, result) => {
    let form = {
        status: 200,
        result
    }

    res.json(form);
}

exports.error = (res, result) =>{
    let form = {
        status: 400,
        result:{"errorMessage":[result]}
    };

    res.json(form);
}