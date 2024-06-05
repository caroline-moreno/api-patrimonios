const valido = (req, res, next) => {
    const expires = (Date.parse(req.session.sess["_expires"]));
    
    if (expires > Date.now()) {
        next();
    } else { res.redirect("/validar"); }
}

const verificar = ((req, res, next) => {
    if (req.session.sess) { valido(req, res, next); }
    else { res.redirect("/validar"); }
});

module.exports = { verificar };