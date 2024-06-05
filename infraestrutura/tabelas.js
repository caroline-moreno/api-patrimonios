class Tabelas {
  init(conexao) {
    this.conexao = conexao;
    this.criarTabelaRegistros();
    this.criarTabelaPatrimonios();
  }

  criarTabelaRegistros() {
    const sql = `
      create table if not exists registros (
      id int not null auto_increment primary key,
      nif int not null not null,
      nome varchar(100) not null,
      email varchar(100) not null,
      senha varchar(100) not null
      );
      `;
    this.conexao.query(sql, (error) => {
      if (error) {
        console.log("Erro ao criar a tabela");
        console.log(error.message);
        return;
      }
      console.log("Tabela registros criada com sucesso");
    });
  }

  criarTabelaPatrimonios() {
    const sql = `
      create table if not exists patrimonios(
      n_inventario int not null primary key,
      dt_incorporacao date not null,
      denominacao_do_imobilizado varchar(100) not null,
      localizacao varchar(100) not null,
      ambiente varchar(100) not null,
      codigo varchar(100) not null,
      defeito varchar(100) default "Não",
      qrcode varchar(100)
      );
      `;
    this.conexao.query(sql, (error) => {
      if (error) {
        console.log("Erro ao criar tabela");
        console.log(error.message);
        return;
      }
      console.log("Tabela patrimonios criada com sucesso");
    });
  }
}

module.exports = new Tabelas();