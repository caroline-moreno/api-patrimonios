const { Router } = require("express");
const registroController = require("../controllers/registroController");
const patrimonioController = require("../controllers/patrimonioController");
const viewController = require("../controllers/viewController")
const { verificar } = require("../middlewares/autenticador");
const { resolver } = require("../middlewares/erro")
const router = Router();

// Páginas EJS

router.get("/", verificar, viewController.inicio);
router.get("/sair", verificar, viewController.sair);
router.get("/validar", resolver(viewController.validar));
router.get("/registrar", resolver(viewController.registrar));
router.get("/listar",verificar, resolver(viewController.listar));
router.get("/registros", verificar, resolver(viewController.registros));
router.get("/escanear", verificar, resolver(viewController.escanear));
router.get("/imprimir", verificar, resolver(viewController.imprimir));
router.get("/cadastrar", verificar, resolver(viewController.cadastrar));
router.get("/importar",/* verificar,*/ resolver(viewController.importar));
router.get("/exportar",verificar, resolver(viewController.exportar));
router.get("/atualizar/:id", verificar, resolver(viewController.atualizar));
router.get("/modificar/:email", verificar, resolver(viewController.modificar));
router.get("/sobre", resolver(viewController.sobre));

// Registro Controller

router.get("/registro/listar", registroController.listar);
router.get("/registro/buscar/:email", registroController.buscar);
router.post("/registro/validar", registroController.validar);
router.post("/registro/verificar", registroController.verificar);
router.post("/registro/criar", registroController.criar);
router.put("/registro/atualizar/:email", registroController.atualizar);
router.delete("/registro/deletar/:email", registroController.deletar);

// Patrimônio Controller

router.get("/patrimonio/listar", patrimonioController.listar);
router.get("/patrimonio/buscar/:id", patrimonioController.buscar);
router.post("/patrimonio/criar", patrimonioController.criar);
router.post("/patrimonio/importar", patrimonioController.importar);
router.post("/patrimonio/exportar", patrimonioController.exportar);
router.post("/patrimonio/imprimir", patrimonioController.imprimir);
router.put("/patrimonio/atualizar/:id", patrimonioController.atualizar);
router.delete("/patrimonio/deletar/:id", patrimonioController.deletar);
router.delete("/patrimonio/truncar", patrimonioController.truncar);

module.exports = router;