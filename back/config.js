const { config } = require("dotenv");

config();

const MERCADOPAGO_APIKEY = process.env.MERCADOPAGO_APIKEY;
const GMAIL = process.env.GMAIL;
const PASSWORD = process.env.PASSWORD;
const URL_TIENDA = process.env.URL_TIENDA;

module.exports = {
    MERCADOPAGO_APIKEY,
    GMAIL,
    PASSWORD,
    URL_TIENDA
}

