const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body.kullanici_id = verified;
    if (req.params.id != verified.kullanici_id) {
      console.log("Baska kullanıcıların projelerini göremezsiniz!");
      res.send("Başka kullanıcıların projelerini göremezsiniz!");
    }
    else {
        next();
    }
    console.log(req.params.id + " " + verified.kullanici_id);
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
}

function authAdmin(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body.rol = verified;
    if (verified.rol != "admin") {
      console.log("Yetkiniz yok!");
      res.send("Yetkiniz yok!");
    }
    else {
        next();
    }
    //console.log(req.params.id + " " + verified.kullanici_id);
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
}


function authLogin(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.body.kullanici_id = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
}



module.exports = { auth, authLogin, authAdmin };
