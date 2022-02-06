const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const { authAdmin } = require("../auth/verifyToken");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  var admin_adi = req.body.admin_adi;
  var admin_sifre = req.body.admin_sifre;

  var sql = "select * from admin where admin_adi = ?";

  connection.query(sql, [admin_adi], (err, result, fields) => {
    if (err) {
      console.log(err);
    }
    if (result.length > 0 && admin_sifre === result[0].admin_sifre) {
      const token = jwt.sign({ rol: result[0].rol }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send({ token: token, result: result });
      console.log("Giriş başarılı!");
    }
  });
});

//get all pdfs
router.get("/getAllPdf", authAdmin, async (req, res) => {
  connection.query(
    "SELECT * FROM `tez`,`kullanici` WHERE tez.kullanici_id = kullanici.kullanici_id",
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//get all users

//get by id
router.get("/getAllUsers/:id", (req, res) => {
  connection.query(
    "select * from `kullanici` where kullanici_id = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

router.get("/getAllUsers", authAdmin, (req, res) => {
  connection.query("select * from `kullanici`", (err, rows, fields) => {
    if (err) {
      console.log("error");
    } else {
      res.send(rows);
    }
  });
});

//delete by id
router.delete("/deleteUser/:id", authAdmin, (req, res) => {
  connection.query(
    "delete from `kullanici` where kullanici_id = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
        console.log("Kullanıcı silindi!");
      }
    }
  );
});

//update by id
router.post("/updateUser/:id", (req, res) => {
  var kullanici_adi = req.body.kullanici_adi;
  var kullanici_sifre = req.body.kullanici_sifre;
  var rol = req.body.rol;
  connection.query(
    "update `kullanici` set kullanici_adi=?,kullanici_sifre=? where kullanici_id=?",
    [kullanici_adi,kullanici_sifre, req.params.id],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetkiniz yok") 
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//insert user
router.post("/addUser", authAdmin, (req, res) => {
  var kullanici_adi = req.body.kullanici_adi;
  var kullanici_sifre = req.body.kullanici_sifre;

  var sql = "select * from kullanici where kullanici_adi = ?";

  connection.query(sql, [kullanici_adi], (err, result, fields) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      res.send("Bu kullanıcı mevcut");
    } else {
      var sql2 =
        "insert into kullanici(kullanici_adi, kullanici_sifre) values (?,?)";
      connection.query(
        sql2,
        [kullanici_adi, kullanici_sifre],
        (err, result, fields) => {
          if (err) {
            console.log(err);
          } else {
            res.send("Kullanıcı eklendi!");
            console.log("Kullanıcı eklendi!");
          }
        }
      );
    }
  });
});

router.post("/getYazar", (req, res) => {
  //var kullanici_id = req.body.rol;
  var yazar_ad = req.body.yazar_ad;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    `select * from tez where ad_soyad like '%${yazar_ad}%'`,
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//derse göre bilgiler
router.post("/getDers", (req, res) => {
  var ders = req.body.ders;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where ders_adı=?",
    [ders],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//başlığa göre
router.post("/getBaslik", (req, res) => {
  var baslik = req.body.baslik;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where baslik=?",
    [baslik],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//döneme göre
router.post("/getDonem", (req, res) => {
  var donem = req.body.donem;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where donem=?",
    [donem],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//yazarın bilgileri
router.post("/getAnahtar", (req, res) => {
  var anahtar_kelime = req.body.anahtar_kelime;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    `select * from tez where anahtar_kelimeler like '%${anahtar_kelime}%'`,
    
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

//sorgu2
router.post("/getDersByDonemKullanici", (req, res) => {
  var donem = req.body.donem;
  var ders = req.body.ders;
  var rol = req.body.rol;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where donem=? and ders_adı=?",
    [donem, ders],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        if(rol != "admin"){
          console.log("Yetki yok!");
        } else {
          res.send(rows);
        }
      }
    }
  );
});

dotenv.config({ path: "./.ENV" });

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log("error");
  } else {
    console.log("connected");
  }
});

module.exports = router;
