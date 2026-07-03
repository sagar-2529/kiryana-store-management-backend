const { sendSuccess, sendError } = require("../utils/response");

let products = [];
let nextId = 1;

const getAll = (req, res) => {
    console.log("Product controller  - GET api/v1/products");
    return sendSuccess(res, 200, products);
};


const getById = (req, res) => {
    console.log("product Controller - api/v1/product by id");

    const product = products.find(p => p.id === Number(req.params.id));

    if (!product) {
        return sendError(res, 404, "Product not found");
    }

    return sendSuccess(res, 200, product);
};

const create = (req, res) => {
    console.log("Profuct Controller - POST api/v1/product");
    const { name, price } = req.body;

    if (!name || price == undefined) {
        return sendError(res, 400, "undefine");
    }

    const duplicate = products.find(p => p.name.toLowerCase() == name.toLowerCase());

    if (duplicate) {
        return sendError(res, 409, "already exists");
    }

    const newProduct = {
        id: nextId,
        name,
        price
    }

    products.push(newProduct);
    nextId++;
    sendSuccess(res, 201, newProduct);

}

const update = (req, res) => {
    console.log("Profuct Controller - PUT api/v1/product");

    const id = products.findIndex(p => p.id == Number(req.params.id));

    if (id == -1) {
        return sendError(res, 404, "product not found");
    }
    const { newName, newPrice } = req.body;

    if (newName !== undefined) products[id].name = newName;
    if (newPrice !== undefined) products[id].price = newPrice;

    return sendSuccess(res, 200, products[id]);

}

const remove = (req, res) => {
    console.log("Profuct Controller - DELETE api/v1/product");

    const id = products.findIndex(p => p.id == req.params.id);

    if (id == -1) {
        return sendError(res, 404, "dont have product with this id");
    }

    const deleted = products.splice(id, 1)[0];

    return sendSuccess(res, 200, "product deleted");

}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
}; 