const { sendSuccess, sendError } = require("../utils/response");

let items = [];
let nextId = 1;

const getAll = (req, res) => {
    console.log("[ItemController] GET /api/v1/items");
    return sendSuccess(res, 200, items);
};

const getById = (req, res) => {
    console.log(`[ItemController] GET /api/v1/items/${req.params.id}`);

    const item = items.find(i => i.id === Number(req.params.id));

    if (!item) {
        return sendError(res, 404, "Item not found");
    }

    return sendSuccess(res, 200, item);
};

const create = (req, res) => {
    console.log("[ItemController] POST /api/v1/items");

    const { name, unitType } = req.body;

    if (!name || !unitType) {
        return sendError(res, 400, "Name and unitType required");
    }

    const duplicate = items.find(
        i => i.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
        return sendError(res, 409, `Item '${name}' already exists`);
    }

    const newItem = {
        id: nextId++,
        name,
        unitType
    };

    items.push(newItem);

    return sendSuccess(res, 201, newItem);
};

const update = (req, res) => {
    console.log(`[ItemController] PUT /api/v1/items/${req.params.id}`);

    const index = items.findIndex(
        i => i.id === Number(req.params.id)
    );

    if (index === -1) {
        return sendError(res, 404, "Item not found");
    }

    const { name, unitType } = req.body;

    if (name !== undefined) items[index].name = name;
    if (unitType !== undefined) items[index].unitType = unitType;

    return sendSuccess(res, 200, items[index]);
};

const remove = (req, res) => {
    console.log(`[ItemController] DELETE /api/v1/items/${req.params.id}`);

    const index = items.findIndex(
        i => i.id === Number(req.params.id)
    );

    if (index === -1) {
        return sendError(res, 404, "Item not found");
    }

    const deleted = items.splice(index, 1)[0];

    return sendSuccess(res, 200, deleted);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};