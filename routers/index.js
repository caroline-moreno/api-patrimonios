const routes = require("./routes");
const viewController = require("../controllers/viewController");
const path = require("path");
const session = require("express-session");
const { Cors } = require("../config/cors");
const { error } = require("../middlewares/erro");

module.exports = (app, express) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(Cors);
    app.use("/public", express.static(path.join(__dirname, "../public")));
    app.set('views', path.join(__dirname, '../views'));
    app.set("view engine", "ejs");
    app.use(session({
        secret: 'dk0la5eDeTsij6H98naksYGYjiffI0I87hfas',
        resave: true,
        saveUninitialized: true
    }));
    app.use('/', routes);
    app.use(viewController.erro);
    app.use(error);
}