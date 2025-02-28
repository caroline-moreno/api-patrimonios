const { ApiUrl } = require("../config/url");

module.exports = async () => {
    const response = await fetch(`${ApiUrl}/registro/listar`);
    const json = await response.json();

    if (json["data"]) {
        json["data"].forEach((r) => {
            r["modificacao"] = {
                href: `/modificar/${r["email"]}`,
                text: "Modificar"
            };
        });
    };

    return json;
}