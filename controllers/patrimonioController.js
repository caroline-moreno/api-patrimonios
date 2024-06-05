const patrimonioModel = require("../models/patrimonioModel");
const qr = require("qrcode");
const pdf = require("html-pdf");
const xlsx = require("xlsx");
const fs = require("fs");
const { ApiUrl } = require("../config/url");
const { response } = require("../helpers/response");
const { checkInputs } = require("../helpers/checkInputs");

class patrimonioController {
    listar(req, res) {
        const listaPatrimonios = patrimonioModel.listar();
        return listaPatrimonios
            .then((patrimonios) => {
                if (patrimonios[0]) {
                    response(res, 200, false, "Patrimônios listados com êxito.", patrimonios)
                } else {
                    response(res, 202, false, "Nenhum patrimônio cadastrado no momento.")
                }
            })
            .catch(() => response(res, 400, true, "Erro interno."));
    }

    buscar(req, res) {
        const { id } = req.params;
        const patrimonio = patrimonioModel.buscar(id);
        return patrimonio
            .then((patrimonio) => {
                if (patrimonio[0]) {
                    response(res, 200, false, "Patrimônio buscado com êxito.", patrimonio);
                } else {
                    response(res, 404, true, "Erro. Patrimônio inexistente.");
                }
            }
            )
            .catch(() => response(res, 400, true, "Erro interno."));
    }

    criar(req, res) {
        const fields = {
            n_inventario: { nome: "Numero de inventário", max: 16, number: true },
            dt_incorporacao: { nome: "Data de incorporação", max: 10, date: true },
            denominacao_do_imobilizado: { nome: "Denominação do imobilizado", min: 8, max: 60 },
            localizacao: { nome: "Localização", min: 4, max: 20 },
            ambiente: { nome: "Ambiente", min: 4, max: 30 },
            codigo: { nome: "Código", min: 1, max: 10 },
            defeito: { nome: "Defeito", min: 3, max: 90, null: true },
        };

        let resultInputs = checkInputs(req.body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            reqData.qrcode = `${ApiUrl}/public/qrcodes/${reqData.n_inventario}.png`;
            buscar(reqData.n_inventario);
        }

        function buscar(n_inventario) {
            const patrimonio = patrimonioModel.buscar(n_inventario);
            patrimonio
                .then((patrimonio) => {
                    if (patrimonio[0]) {
                        response(res, 409, true, "Erro. Este número de inventário já está sendo ultilizado.");
                    } else {
                        cadastrar();
                    }
                })
                .catch(() => response(res, 400, true, "Erro interno."));
        }

        function cadastrar() {
            const patrimonio = patrimonioModel.criar(reqData);
            return patrimonio
                .then(() => {
                    qr.toFile(
                        `./public/qrcodes/${reqData.n_inventario}.png`,
                        `${reqData.n_inventario} - ${reqData.denominacao_do_imobilizado}`,
                        { type: "png" }
                    );

                    response(res, 201, false, `Patrimônio n° ${reqData.n_inventario} criado com sucesso.`);
                })
                .catch((e) => { console.log(e); response(res, 400, true, "Erro interno.") });
        }
    }

    importar(req, res) {
        const fileName = `${Date.now()}${req["sessionID"]}`;

        async function createFile() {
            let data = [];
            const byte = 60000;
            const kilobyte = byte / 1000;
            const file = fs.createWriteStream(`./public/xlsx/import/${fileName}`);

            req.on("data", chunk => { data.push(chunk); });
            req.on("end", () => {
                data = Buffer.concat(data);

                if (data.length > byte) {
                    file.end();
                    deleteFile(400, true, `Erro. Este arquivo supera o limite de tamanho (${kilobyte} KB).`);
                } else {
                    file.write(data);
                    file.end("end", (error) => {
                        if (error) { console.log("error"); }
                        readFile();
                        //response(res, 200, false, "Teste");
                    });
                }
            });
        }

        function deleteFile(status, error, message) {
            fs.unlinkSync(`./public/xlsx/import/${fileName}`);
            response(res, status, error, message);
        }

        function readFile() {
            async function buscar(n_inventario) {
                const patrimonio = patrimonioModel.buscar(n_inventario);
                const resolve = await patrimonio
                    .then((data) => {
                        if (data[0]) { existente++; }
                    })
                    .catch((error) => res.status(400).json(error.message));
            }

            async function cadastrar(patrimonio) {
                const novo = {
                    n_inventario: patrimonio['Nº invent.'],
                    dt_incorporacao: patrimonio['Dt.incorp.'],
                    denominacao_do_imobilizado: patrimonio['Denominação do imobilizado'],
                    localizacao: patrimonio['Localiz.'],
                    ambiente: patrimonio['Ambiente'],
                    codigo: patrimonio['Código'],
                    qrcode: `${ApiUrl}/public/qrcodes/${patrimonio["Nº invent."]}.png`
                }
                const novoPatrimonio = patrimonioModel.criar(novo);

                return novoPatrimonio
                    .then(() => {
                        qr.toFile(
                            `./public/qrcodes/${novo.n_inventario}.png`,
                            `${novo.n_inventario} - ${novo.denominacao_do_imobilizado}`,
                            { type: "png" }
                        );

                        return;
                    })
                    .catch(() => { cadastro++; response(res, 400, true, "Erro interno.") });
            }

            async function cadastrarPatrimonios() {
                for (let patrimonio of patrimonios) {
                    if (cadastro > 0) {
                        break;
                    }

                    await cadastrar(patrimonio);
                }

                if (cadastro > 0) {
                    deleteFile(400, true, "Erro ao cadastrar patrimônios.")
                } else {
                    deleteFile(201, false, "Importação concluída com êxito.");
                }
            }

            async function verificar() {
                for (let patrimonio of patrimonios) {
                    if (listaId.includes(patrimonio['Nº invent.'])) {
                        repetido++;
                        break;
                    } else {
                        listaId.push(patrimonio['Nº invent.']);

                        await buscar(patrimonio['Nº invent.']);

                        if (existente > 0) {
                            break;
                        }
                    }
                }

                if (repetido > 0) {
                    deleteFile(400, true, "Erro. Este arquivo possuí números de inventário repetidos.");
                } else if (existente > 0) {
                    deleteFile(400, true, "Erro. O arquivo possuí números de patrimônios já existentes.");
                } else {
                    cadastrarPatrimonios();
                }
            }

            function read() {
                const file = xlsx.readFile(`./public/xlsx/import/${fileName}`);
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
                const fields = {
                    'Nº invent.': { nome: "Numero de inventário", max: 16, number: true },
                    'Dt.incorp.': { nome: "Data de incorporação", max: 10, date: "formatar" },
                    'Denominação do imobilizado': { nome: "Denominação do imobilizado", min: 8, max: 60 },
                    'Localiz.': { nome: "Localização", min: 4, max: 20 },
                    'Ambiente': { nome: "Ambiente", min: 4, max: 30 },
                    'Código': { nome: "Código", min: 1, max: 10 }
                };
                let errorMessage;

                for (let line of temp) {
                    let resultInputs = checkInputs(line, fields);
                    let reqData = resultInputs.data;

                    if (resultInputs.error == true) {
                        errorMessage = resultInputs.message;
                        break;
                    }

                    patrimonios.push(reqData);
                }

                if (errorMessage != undefined) {
                    response(res, 400, true, errorMessage);
                } else {
                    verificar();
                }
            }

            let patrimonios = [];
            let listaId = [];
            let existente = 0;
            let repetido = 0;
            let cadastro = 0;

            try {
                read();
            } catch (error) {
                console.log(error)
                deleteFile(400, true, "Erro ao ler arquivo. Envie um arquivo XLSX válido.");
            }
        }

        createFile();
    }

    async exportar(req, res) {
        const fileName = `${Date.now()}${req["sessionID"]}`;
        let list;
        let inexistente = 0;
        const patrimonios = [];
        const body = { list: `${req.body.list}` };
        const fields = {
            list: { nome: "Lista de exportação", max: 3000, list: true }
        }
        let resultInputs = checkInputs(body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            list = reqData.list;
            verificar();
        }

        async function buscar(n_inventario) {
            const patrimonio = patrimonioModel.buscar(n_inventario);
            const resolve = await patrimonio
                .then((data) => {
                    if (!data[0]) { inexistente++; }
                    else { patrimonios.push(data[0]); }
                })
                .catch((error) => res.status(400).json(error.message));
        }

        function createXLSX(patrimonios) {
            patrimonios = JSON.stringify(patrimonios);
            patrimonios = JSON.parse(patrimonios);

            const keys = Object.keys(patrimonios[0]);

            const head = {
                n_inventario: ['Nº invent.'],
                dt_incorporacao: ['Dt.incorp.'],
                denominacao_do_imobilizado: ['Denominação do imobilizado'],
                localizacao: ['Localiz.'],
                ambiente: ['Ambiente'],
                codigo: ['Código']
            };

            patrimonios.forEach((p) => {
                keys.forEach((key) => {
                    if (key == "dt_incorporacao") {
                        let date = p[key].slice(0, 10).split("-");
                        p[key] = `${date[2]}.${date[1]}.${date[0]}`;
                    }
                    if (!head[key]) {
                        delete p[key];
                    } else {
                        delete Object.assign(p, { [head[key]]: p[key] })[key];
                    };
                });
            });

            const worksheet = xlsx.utils.json_to_sheet(patrimonios);
            const workbook = xlsx.utils.book_new();

            xlsx.utils.book_append_sheet(workbook, worksheet, "Patrimônios");
            xlsx.writeFile(workbook, `./public/xlsx/export/${fileName}.xlsx`);

            const url = `/public/xlsx/export/${fileName}.xlsx`;

            response(res, 201, false, "Arquivo XLSX criado com êxito.", url);

            new Promise(() => {
                setTimeout(() => {
                    fs.unlinkSync((`./${url}`));
                }, 3000);
            });
        }

        async function verificar() {
            for (let e of list) {
                await buscar(e);
                if (inexistente > 0) {
                    break;
                }
            }

            if (inexistente > 0) {
                response(res, 400, true, "Erro. Alguns patrimônios não foram cadastrados.");
            } else {
                createXLSX(patrimonios);
            }
        }
    }

    async imprimir(req, res) {
        const fileName = `${Date.now()}${req["sessionID"]}`;
        let list;
        let inexistente = 0;
        const patrimonios = [];
        const body = { list: `${req.body.list}` };
        const fields = {
            list: { nome: "Lista de impressão", max: 3000, list: true }
        }
        let resultInputs = checkInputs(body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            list = reqData.list;
            verificar();
        }

        async function buscar(n_inventario) {
            const patrimonio = patrimonioModel.buscar(n_inventario);
            const resolve = await patrimonio
                .then((data) => {
                    if (!data[0]) { inexistente++; }
                    else { patrimonios.push(data[0]); }
                })
                .catch(() => response(res, 400, true, "Erro interno."));
        }

        function gerarHTML(patrimonios) {
            let column = 4;
            let lines = 10;
            let contador = 0;
            let tables = [];
            let trs = [];
            let tr = [];
            let td = [];
            let white = [];
            let blank = `
            <td><div><img src="${ApiUrl}/public/qrcodes/blank.png"><p></p></div></td>
            `
            let text = ``;

            patrimonios.forEach((patrimonio) => {
                if (contador % column == 0 && contador != 0) {
                    tr.push(td);
                    td = [];
                }
                td.push(`
                    <td>
                    <div>
                    <img src="${patrimonio.qrcode}">
                    <p>
                    ${patrimonio.n_inventario}<br>
                    <img src="${ApiUrl}/public/img/senai.png" id="senai">
                    </p>
                    </div>
                    </td>
                `);
                contador++;
            });

            if (td[0]) {
                while (td.length < column) {
                    td.push(blank);
                }
                tr.push(td);
            }

            contador = 0;

            tr.forEach((line) => {
                if (contador % lines == 0 && contador != 0) {
                    tables.push(trs);
                    trs = [];
                }
                contador++;
                trs.push(line);
            });

            contador = 0;

            if (trs[0]) {
                while (trs.length < lines) {
                    while (contador < column) {
                        white.push(blank);
                        contador++;
                    }
                    trs.push(white);
                }
                tables.push(trs);
            }

            tables.forEach((table) => {
                text = text + `<table>`;
                table.forEach((line) => {
                    text = text + `<tr>`;
                    line.forEach((content) => {
                        text = text + `${content}`;
                    })
                    text = text + `</tr>`;
                })
                text = text + `</table>`;
            });

            let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="${ApiUrl}/public/css/pdf.css">
            <title>Document</title>
            </head>
            <body>
            ${text}
            </body>
            </html>
            `;

            gerarPDF(html);
        }

        function gerarPDF(html) {
            let options = {
                "height": "29.7cm",
                "width": "21cm",
                "format": "Letter",
                "orientation": "portrait"
            };

            pdf.create(html, options).toFile(`./public/pdf/${fileName}.pdf`, (error, file) => {
                if (error) {
                    console.log(error);
                };

                const filename = file["filename"].split("\\").pop();
                const url = `/public/pdf/${filename}`;

                response(res, 201, false, "Arquivo gerado com êxito.", url);

                const Delete = new Promise(() => {
                    setTimeout(() => {
                        fs.unlinkSync((`./public/pdf/${fileName}.pdf`));
                    }, 10000);
                });
            });
        }

        async function verificar() {
            for (let e of list) {
                await buscar(e);
                if (inexistente > 0) {
                    break;
                }
            }

            if (inexistente > 0) {
                response(res, 400, true, "Erro. Alguns patrimônios não foram cadastrados.");
            } else {
                gerarHTML(patrimonios);
            }
        }
    }

    atualizar(req, res) {
        const { id } = req.params;
        const body = req.body;
        const fields = {
            dt_incorporacao: { nome: "Data de incorporação", max: 10, date: true },
            denominacao_do_imobilizado: { nome: "Denominação do imobilizado", min: 8, max: 60 },
            localizacao: { nome: "Localização", min: 3, max: 20 },
            ambiente: { nome: "Ambiente", min: 3, max: 30 },
            codigo: { nome: "Código", min: 1, max: 10 },
            defeito: { nome: "Defeito", min: 3, max: 90, null: true },
        };

        let resultInputs = checkInputs(body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            atualizar(reqData);
        }

        function atualizar(patrimonioAtualizado) {
            const patrimonio = patrimonioModel.atualizar(patrimonioAtualizado, id);
            return patrimonio
                .then(() => response(res, 200, false, `Patrimônio n° ${id} atualizado com êxito.`))
                .catch(() => response(res, 400, true, "Erro interno."));
        }
    }

    deletar(req, res) {
        const { id } = req.params;
        const patrimonio = patrimonioModel.deletar(id);
        return patrimonio
            .then(() => {
                fs.unlinkSync(`./public/qrcodes/${id}.png`);
                response(res, 200, false, `Patrimônio n° ${id} excluido com êxito.`);
            })
            .catch(() => response(res, 400, true, "Erro interno."));
    }

    truncar(req, res) {
        const patrimonio = patrimonioModel.truncar();
        return patrimonio
            .then(() => {
                let dir = fs.readdirSync("./public/qrcodes");
                dir.forEach(async (file) => {
                    if (file != "qrcodes.txt" && file != "blank.png") {
                        fs.unlinkSync(`./public/qrcodes/${file}`);
                    }
                });

                response(res, 200, false, "Patrimônios truncados com êxito.");
            })
            .catch(() => response(res, 400, true, "Erro interno."));
    }

}

module.exports = new patrimonioController;