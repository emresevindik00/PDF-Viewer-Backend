const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dotenv = require("dotenv");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { auth } = require("../auth/verifyToken");
const PDFParser = require("pdf2json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  },
});
const upload = multer({ storage });

//sisteme pdf yükleme
router.post("/file", upload.single("file"), (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var file_name = req.file.originalname;
  let pdfParser = new PDFParser(this, 1);
  pdfParser.loadPDF(`uploads/${file_name}`);
  pdfParser.on("pdfParser_dataError", (errData) =>
    console.error(errData.parserError)
  );

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    let raw = pdfParser.getRawTextContent();
    console.log(raw);

    //Ders
    let dersPatternn = /BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ \r\n \r\n \r\n.*/gi;
    console.log()
    var matchesDers = [],
      foundDers;
    while ((foundDers = dersPatternn.exec(raw))) {
      matchesDers.push(foundDers[0]);
      matchesDers.lastIndex -= foundDers[0].split("")[1].length;
    }
    console.log(
      "Ders:" +
        matchesDers[1]
          .toString()
          .replace(/BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ \r\n \r\n \r\n/, "")
    );
    var dersAdi = matchesDers[1]
      .toString()
      .replace(/BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ \r\n \r\n \r\n/, "");

    //Başlık
    let baslikPattern = RegExp(dersAdi + "\\s\\n\\s\\r\\n\\s\\r\\n.*", "gi");
    let baslik = baslikPattern
      .exec(raw)
      .toString()
      .replace(/\r\n/g, " ")
      .replace(dersAdi, "")
      .trim();
    console.log("Proje Başlığı:" + baslik);

    //Danışman
    let danismanPattern = /Prof.*/gi;
    let danisman = danismanPattern.exec(raw).toString();
    console.log("Danışman:", danisman);

    //Jüri1
    let juriPattern = /Doç.*/gi;
    let juri = juriPattern.exec(raw).toString();
    console.log("Jüri1:", juri);

    //Jüri2
    let juri2Pattern = /Öğr.*/gi;
    let juri2 = juri2Pattern.exec(raw).toString();
    console.log("Jüri2:", juri2);

    let juriler = juri + " " + juri2;

    //Tarih --> Gerçek tarihe çevir
    let tarihPattern = /Tezin Savunulduğu Tarih: .*/gi;
    let tarih = tarihPattern
      .exec(raw)
      .toString()
      .replace(/Tezin Savunulduğu Tarih: /gi, "")
      .replaceAll(".", "-")
      .split()
      .toString();
    console.log("Tarih:", tarih);
    
      
  
    let donemTarih = new Date(tarih);
    console.log("aa: "+donemTarih.toLocaleDateString());
    let donemAdi;
    if (
      (donemTarih.toLocaleDateString().charAt(1) == "1")
    ) {
      donemAdi = donemTarih.getUTCFullYear() +"-"+(donemTarih.getUTCFullYear()+1) + " Güz dönemi";
      console.log("yıl: "+donemTarih.getMonth());
    } else if (onemTarih.toLocaleDateString().charAt(1) == "6") {
      donemAdi = donemTarih.getUTCFullYear() + "-"+ (donemTarih.getUTCFullYear()+1) + " Bahar dönemi";
      console.log("yıl: "+donemTarih.getDay());
    }

    //Öğrenci Numarası1

    let noPattern = /Öğrenci No: .*/gi;
    var matchesNo = [],
      found,
      matchesAd = [];
    while ((found = noPattern.exec(raw))) {
      matchesNo.push(found[0]);
      noPattern.lastIndex -= found[0].split("")[1].length;
    }
    let ogrenci_no = matchesNo.toString().replace(/Öğrenci No: /gi, "");
    console.log(
      "Öğrenci No:" + matchesNo.toString().replace(/Öğrenci No: /gi, "")
    );

    //Öğretim Türü
    let ogretim_turu;
    if(ogrenci_no.match(/202/g)){
      console.log("İkinci öğretim");
      ogretim_turu = "İkinci öğretim";
    } 
    else if(ogrenci_no.match(/201/g)){
      console.log("Birinci Öğretim");
      ogretim_turu = "Birinci Öğretim";
    }

    //Öğrenci Adı
    let adPattern = /Adı Soyadı: .*/gi;
    while ((found = adPattern.exec(raw))) {
      matchesAd.push(found[0]);
      adPattern.lastIndex -= found[0].split(":")[1].length;
    }
    let ad_soyad = matchesAd.toString().replace(/Adı Soyadı: /gi, "");
    console.log(
      "Öğrenci Adı:" + matchesAd.toString().replace(/Adı Soyadı: /gi, "")
    );

    let raw2 = pdfParser.getRawTextContent().replace(/\r\n/g, " ");
    //Özet
    let ozetPattern = /TÜRKÇE KISIM\s(.*?)Anahtar/gi;
    let ozet = ozetPattern.exec(raw2)[1].toString().trim().replace(/ÖZET/gi, "");
    console.log("Özet:", ozet);

    //Anahtar Kelimeler
    let keyPattern = /Anahtar kelimeler:\s.*/gi;
    let keys = keyPattern
      .exec(raw)
      .toString()
      .trim()
      .replace(/Anahtar kelimeler:\s/g, "");
    console.log("Anahtar Kelimeler:", keys);
    //update where pdf_isim = file_name
    var sql =
      "insert into tez(pdf_isim,kullanici_id,ad_soyad,ogrenci_no,ders_adı,ozet,donem,baslik,anahtar_kelimeler,danisman,juri,ogretim_turu) values (?,?,?,?,?,?,?,?,?,?,?,?)";
    connection.query(
      sql,
      [
        file_name,
        kullanici_id,
        ad_soyad,
        ogrenci_no,
        dersAdi,
        ozet,
        donemAdi,
        baslik,
        keys,
        danisman,
        juriler,
        ogretim_turu
      ],
      (err, result, fields) => {
        if (err) {
          console.log(err);
        } else {
          console.log("PDF Yüklendi!");
        }
      }
    );
  });
});

//yazarın bilgileri
router.post("/getYazar", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var yazar_ad = req.body.yazar_ad;

  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    `select * from tez where kullanici_id=? and ad_soyad like '%${yazar_ad}%'`,
    [kullanici_id],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//derse göre bilgiler
router.post("/getDers", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var ders = req.body.ders;

  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where kullanici_id=? and ders_adı=?",
    [kullanici_id, ders],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//başlığa göre
router.post("/getBaslik", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var baslik = req.body.baslik;

  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where kullanici_id=? and baslik=?",
    [kullanici_id, baslik],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//döneme göre
router.post("/getDonem", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var donem = req.body.donem;

  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where kullanici_id=? and donem=?",
    [kullanici_id, donem],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//yazarın bilgileri
router.post("/getAnahtar", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var anahtar_kelime = req.body.anahtar_kelime;

  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    `select * from tez where kullanici_id=? and anahtar_kelimeler like '%${anahtar_kelime}%'`,
    [kullanici_id],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//sorgu2
router.post("/getDersByDonemKullanici", (req, res) => {
  var kullanici_id = req.body.kullanici_id;
  var donem = req.body.donem;
  var ders = req.body.ders;
  connection.query(
    //'SELECT * from tez where and ad_soyad like ?', '%' + yazar_ad + '%',
    "select * from tez where kullanici_id=? and donem=? and ders_adı=?",
    [kullanici_id, donem, ders],
    (err, rows, fields) => {
      if (err) {
        console.log("error");
      } else {
        res.send(rows);
      }
    }
  );
});

//pdfleri getir
router.get("/getAllFile", (req, res) => {
  connection.query("select * from tez", (err, rows, fields) => {
    if (err) {
      console.log("error");
    } else {
      res.send(rows);
    }
  });
});

//id'ye göre pdf getir
router.get("/getAllFile/:id", auth, (req, res) => {
  connection.query(
    "select * from tez where kullanici_id = ?",
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

//login
router.post("/login", (req, res) => {
  var kullanici_adi = req.body.kullanici_adi;
  var kullanici_sifre = req.body.kullanici_sifre;

  var sql = "select * from kullanici where kullanici_adi = ?";

  connection.query(sql, [kullanici_adi], (err, result, fields) => {
    if (err) {
      console.log(err);
    }
    if (result.length > 0 && kullanici_sifre === result[0].kullanici_sifre) {
      const token = jwt.sign(
        { kullanici_id: result[0].kullanici_id },
        process.env.TOKEN_SECRET
      );
      res.header("auth-token", token).send({ token: token, result: result });
      console.log("Giriş başarılı!");
    }
  });
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
