const patrimonios = require("../utils/patrimonios");
const registros = require("../utils/registros");

const renderizar = (res, body) => {
    res.render("index", { body: body });
}

class viewController {
    inicio(req, res) {
        res.redirect("/listar");
    }

    validar(req, res) {
        renderizar(res, { body: 'validar' });
    }

    sair(req, res) {
        delete req.session.sess;
        res.redirect("/validar")
    }

    registrar(req, res) {
        let valido = false;
        if (req.session.sess) { valido = true; }
        else {valido = false}
        renderizar(res, { body: 'registrar', valido: valido });
    }

    async listar(req, res) {
        const json = await patrimonios();
        renderizar(res, { body: 'listar', tabela: json });
    }

    async registros(req, res) {
        const json = await registros();
        renderizar(res, { body: 'registros', tabela: json });
    }


    escanear(req, res) {
        renderizar(res, { body: 'escanear' });
    }

    async imprimir(req, res) {
        const json = await patrimonios();
        renderizar(res, { body: 'imprimir', tabela: json });
    }

    cadastrar(req, res) {
        renderizar(res, { body: 'cadastrar' });
    }

    importar(req, res) {
        renderizar(res, { body: 'importar' });
    }

    async exportar(req, res) {
        const json = await patrimonios();
        renderizar(res, { body: 'exportar', tabela: json });
    }

    atualizar(req, res) {
        const { id } = req.params;
        renderizar(res, { body: 'atualizar', id: id });
    }

    modificar(req, res) {
        const { email } = req.params;
        renderizar(res, { body: 'modificar', email: email });
    }

    sobre(req, res) {
        renderizar(res, { body: 'sobre' });
    }

    erro(req, res) {
        renderizar(res, { body: 'erro' });
    }
}

module.exports = new viewController;