const registroModel = require("../models/registroModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { response } = require("../helpers/response");
const { checkInputs } = require("../helpers/checkInputs");

class registroController {
    listar(req, res) {
        const listaRegistros = registroModel.listar();
        return listaRegistros
            .then((registros) => {
                if (registros[0]) {
                    response(res, 200, false, "Registros listados com êxito.", registros)
                } else {
                    response(res, 202, false, "Nenhum registro existente.")
                }
            })
            .catch(() => response(res, 400, true, "Erro interno."));
    }

    buscar(req, res) {
        const { nif } = req.params;
        const registro = registroModel.buscar(nif);
        return registro
            .then((registro) => {
                if (registro[0]) {
                    response(res, 200, false, "Registro buscado com êxito.", registro);
                } else {
                    response(res, 404, true, "Registro inexistente.");
                }
            })
            .catch(() => response(res, 400, true, "Erro interno."));
    }

    validar(req, res) {
        const fields = {
            nif: { nome: "Nif", max: 20 },
            senha: { nome: "Senha", max: 20 }
        };

        let resultInputs = checkInputs(req.body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            buscar(reqData.nif);
        }

        function buscar(nif) {
            const registro = registroModel.buscarNif(nif);
            const resolve = registro
                .then((registro) => {
                    if (registro[0]) {
                        validar(registro[0])
                    } else {
                        response(res, 400, true, "Erro. Nif ou senha incorretos.");
                    }
                })
                .catch((error) => res.status(400).json(error.message));
        }

        async function validar(registro) {
            if ((await bcrypt.compare(reqData.senha, registro.senha))) {
                let token = jwt.sign(
                    { session: true, nome: registro.nome, nif: registro.nif },
                    "s546456ke4564GdfhxdfGP&*FE`56$&*655677567igIGJa",
                    { expiresIn: 3600 } // 3600 = 1 hora
                );

                const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 * 60 * 1000 = 1 hora

                req.session.sess = { path: '/', _expires: expires, originalMaxAge: expires, httpOnly: true };

                response(res, 200, false, "Validação concluída com êxito.", token);
            } else {
                response(res, 400, true, "Erro. Nif ou senha incorretos.");
            }
        }
    }

    async verificar(req, res) {
        const token = req.body.token;

        try {
            const decode = await promisify(jwt.verify)(token, "s546456ke4564GdfhxdfGP&*FE`56$&*655677567igIGJa");
            response(res, 200, false, "Token inválido", decode);
        } catch (error) {
            response(res, 400, true, "Token inválido");
        }

    }

    async criar(req, res) {
        const fields = {
            nome: { nome: "Nome", min: 10, max: 60, ndc: ["especiais", "numeros"] },
            nif: { nome: "Nif", min: 7, max: 7, ndc: ["especiais"] },
            email: { nome: "E-mail", min: 12, max: 40, obg: ["@", "."], ndc: ["especiais"] },
            senha: { nome: "Senha", min: 5, max: 20 }
        };

        let resultInputs = checkInputs(req.body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            reqData.senha = await bcrypt.hash(reqData.senha, 8);

            buscar(reqData.email);
        }

        function buscar(email) {
            const registro = registroModel.buscar(email);
            const resolve = registro
                .then((registro) => {
                    if (registro[0]) {
                        console.log(email)
                        response(res, 400, true, "Erro. Este E-mail já está sendo ultilizado.");
                    } else {
                        criar();
                    }
                })
                .catch(() => response(res, 400, true, "Erro interno."));
        }

        function criar() {
            const registro = registroModel.criar(reqData);
            return registro
                .then(() => response(res, 201, false, "Agente registrado com sucesso."))
                .catch(() => response(res, 400, true, "Erro interno."));
        }
    }

    atualizar(req, res) {
        const { email } = req.params;

        if (!req.body.novaSenha) {
            req.body.novaSenha = "";
        }

        const fields = {
            nome: { nome: "Nome", min: 10, max: 60, ndc: ["especiais", "numeros"] },
            nif: { nome: "Nif", min: 7, max: 7, ndc: ["especiais"] },
            email: { nome: "E-mail", min: 12, max: 40, obg: ["@", "."], ndc: ["especiais", "acentos"] },
            senha: { nome: "Senha", max: 20 },
            novaSenha: { nome: "Nova senha", min: 5, max: 20, null: true }
        };

        let resultInputs = checkInputs(req.body, fields);
        let reqData = resultInputs.data;

        if (resultInputs.error == true) {
            response(res, 400, true, resultInputs.message);
            return;
        } else {
            buscar(email);
        }

        async function buscar(email) {
            const registro = registroModel.buscar(email);
            await registro
                .then((registro) => {
                    if (registro[0]) {
                        atualizar(registro[0]);
                    } else {
                        response(res, 400, true, "Erro. Registro inexistente.");
                    }
                })
                .catch(() => response(res, 400, true, "Erro interno."));
        }

        async function atualizar(registro) {
            if ((await bcrypt.compare(reqData.senha, registro.senha))) {
                if (reqData.email != email) {
                    const registro = registroModel.buscar(reqData.email);
                    await registro
                        .then((registro) => {
                            if (registro[0]) {
                                response(res, 409, true, "Erro. Este E-mail já está sendo ultilizado.");
                            } else {
                                modificar();
                            }
                        })
                        .catch(() => response(res, 400, true, "Erro interno."));
                } else {
                    modificar();
                }

            } else {
                response(res, 400, true, "Erro. Senha atual incorreta.")
            };
        };

        async function modificar() {
            let senha = reqData.senha;

            if (reqData.novaSenha != "") {
                senha = reqData.novaSenha;
            };

            senha = await bcrypt.hash(senha, 8);

            reqData.senha = senha;

            delete reqData.novaSenha;

            const registroAtualizado = reqData;
            const registro = registroModel.atualizar(registroAtualizado, email);
            return registro
                .then(() => response(res, 200, false, "Registro modificado com êxito."))
                .catch(() => response(res, 400, true, "Erro interno."));
        };
    }

    deletar(req, res) {
        const { email } = req.params;
        const registro = registroModel.deletar(email);
        return registro
            .then(() => response(res, 200, false, "Registro deletado com êxito."))
            .catch(() => response(res, 400, true, "Erro interno."));
    }

}

module.exports = new registroController;