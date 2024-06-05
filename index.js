const express = require("express");
const app = express();
const port = 3000;
const config = require("./config/config");

config(app, express);

app.listen(port, (error) => {
    if (error) { console.error("Erro"); }

    console.log(`Aplicação na porta ${port}`);
});