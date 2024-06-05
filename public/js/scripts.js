async function fetchUrlencoded(route, method, body) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    let urlencoded = new URLSearchParams();

    const keys = Object.keys(body);
    const values = Object.values(body);
    let count = 0;

    keys.forEach((key) => {
        urlencoded.append(key, values[count++]);
    });

    let requestOptions = {
        method: method,
        headers: myHeaders,
        body: urlencoded
    };

    const response = await fetch(`${route}`, requestOptions);
    const json = await response.json();

    return json;
}

function redirecionar(req, url) {
    if (req.error == true) {
        erro(req.message);
        console.log("Error")
    } else {
        window.location.replace(`${url}`);
    }
}

function listarNumeros() {
    let table = document.getElementsByTagName("tbody")[0];
    let list = [];
    const linhas = table.getElementsByTagName("tr");

    Object.values(linhas).forEach((linha) => {
        if (linha.style.display != "none") {
            list.push(linha.children[0].innerText);
        };
    });

    return list;
}

function erro(text) {
    message.innerHTML = text;
    message.style.display = "block";
}

function iniciarCarregamento(button, carregando) {
    button.style.display = "none";
    carregando.style.display = "block";
}

function finalizarCarregamento(button, carregando) {
    button.style.display = "block";
    carregando.style.display = "none";
}

function enviarLista(func) {
    let list = listarNumeros();
    let button = document.getElementById("boxSearchButton");
    let carregando = document.getElementById("carregando");

    iniciarCarregamento(button, carregando);

    func({ list: list });
}

async function sendFetch(route, method, body, redirect, compare = undefined) {
    let inputs = body.getElementsByTagName("input");
    let reqData = {};

    Object.values(inputs).forEach((input) => {
        reqData[`${input.id}`] = `${input.value}`;
    });

    if (compare != undefined) {
        let errorMessage;
        let keys = Object.keys(reqData);

        for (let field of compare.data) {
            if (!keys.includes(field) || compare.data.length > 2) {
                errorMessage = "Erro ao comparar campos.";
                break;
            }
        }

        if (errorMessage != undefined) {
            message.innerHTML = errorMessage;
            message.style.display = "block";
            return;
        }

        if (reqData[compare.data[0]] != reqData[compare.data[1]]) {
            message.innerHTML = compare.message;
            message.style.display = "block";
            return;
        }

        delete reqData[compare.data[1]];
    }

    const response = await fetchUrlencoded(route, method, reqData);
    redirecionar(response, redirect);
}

async function getDataForInputs(route, head) {
    const response = await fetch(route);
    const json = await response.json();

    if (json["status"] == 200) {
        formHTML(head, json["data"][0]);
    } else {
        window.location.replace("/erro");
    };
}

function formHTML(head, reqData) {
    const form = document.getElementById("form")
    let formText = "";
    const keysHead = Object.keys(head);
    let errorMessage;

    console.log(head)

    keysHead.forEach((key) => {
        if (head[key].tag.value) {
            return;
        };

        if (!reqData[key]) {
            errorMessage = "Erro no cabeçalho.";
        };
    });

    if (errorMessage != undefined) {
        message.innerHTML = "Erro no cabeçalho.";
        message.style.display = "block";
        return;
    }

    function defineInput(label, type, value, id) {
        formText = formText + `
            <div>
                <label><p>${label}</p></label>
                <input type="${type}" value="${value}" id="${id}" class="input"><br><br>
            </div>
        `;
    }

    keysHead.forEach((key) => {
        if (head[key].tag.name == "input") {
            if (head[key].tag.value) {
                if (head[key].tag.value == "null") {
                    defineInput(head[key].label, head[key].tag.type, "", key);
                    return;
                } else {
                    defineInput(head[key].label, head[key].tag.type, head[key].tag.value, key);
                    return;
                }
            }

            if (head[key].tag.type != "date") {
                defineInput(head[key].label, head[key].tag.type, reqData[key], key);
            }

            if (head[key].tag.type == "date") {
                let date = reqData[key].slice(0, 10).split("-");
                date = `${date[0]}-${date[1]}-${date[2]}`;
                defineInput(head[key].label, head[key].tag.type, date, key);
            }
        }

        if (head[key].tag.name == "img") {
            formText = formText + `
            <div class="center">
                <img src="${reqData[key]}">
            </div><br>
            `;
        }
    });

    formText = formText + `
        <div class="center">
            <button>Atualizar</button><br><br>
        </div>
    `;
    form.innerHTML = formText;
}

function checkQRCode(text) {
    console.log(text)

    if (text.includes(" - ") || Number(text.split(" - ")[0]) > 0) {
        buscar(codigo);
    } else {
        erro("Erro. Este código não corresponde com os padrões da empresa SENAI.");
    }
}