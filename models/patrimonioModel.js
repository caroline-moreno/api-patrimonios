const conexao = require("../infraestrutura/conexao");
class PatrimonioModel {
    executaQuery(sql, parametros = "") {
        return new Promise((resolve, reject) => {
            conexao.query(sql, parametros, (error, resposta) => {
                if (error) {
                    return reject(error);
                }

                return resolve(resposta)
            });
        });
    }

    listar() {
        const sql = "SELECT * FROM patrimonios";
        return this.executaQuery(sql);
    }

    buscar(id) {
        const sql = "SELECT * FROM patrimonios WHERE n_inventario = ?";
        return this.executaQuery(sql, id);
    }

    criar(novoPatrimonio) {
        const sql = "INSERT INTO patrimonios SET ?";
        return this.executaQuery(sql, novoPatrimonio);
    }

    atualizar(patrimonioAtualizado, id) {
        const sql = "UPDATE patrimonios SET ? WHERE n_inventario = ?";
        return this.executaQuery(sql, [patrimonioAtualizado, id]);
    }

    deletar(id) {
        const sql = "DELETE FROM patrimonios WHERE n_inventario = ?";
        return this.executaQuery(sql, id);
    }

    truncar() {
        const sql = "TRUNCATE TABLE patrimonios";
        return this.executaQuery(sql);
    }
}

module.exports = new PatrimonioModel();