const { ApiUrl } = require("../config/url");

module.exports = async () => {
    const response = await fetch(`${ApiUrl}/patrimonio/listar`);
    const json = await response.json();

    if (json["data"]) {
        json["data"].forEach((p) => {
            p["atualizacao"] = {
                href: `/atualizar/${p["n_inventario"]}`,
                text: "Atualizar"
            };
        });
    }

    return json
}