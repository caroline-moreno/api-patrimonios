const conexao = require("../infraestrutura/conexao");
class RegistroModel {
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
        const sql = "SELECT * FROM registros";
        return this.executaQuery(sql);
    }

    buscar(email) {
        const sql = "SELECT * FROM registros WHERE email = ?";
        return this.executaQuery(sql, email);
    }

    buscarNif(nif) {
        const sql = "SELECT * FROM registros WHERE nif = ?";
        return this.executaQuery(sql, nif);
    }

    criar(novoRegistro) {
        const sql = "INSERT INTO registros SET ?";
        return this.executaQuery(sql, novoRegistro);
    }

    atualizar(registroAtualizado, email) {
        
        const sql = "UPDATE registros SET ? WHERE email = ?";
        return this.executaQuery(sql, [registroAtualizado, email]);
    }

    deletar(email) {
        const sql = "DELETE FROM registros WHERE email = ?";
        return this.executaQuery(sql, email);
    }
}

module.exports = new RegistroModel();