const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, "public")));
const library = require("./public/default.json");
//router.use(require("cookie-parser"));

router.get("/",
    (req, res, next) => {
        //let lib = {field: "value"};
        res.render("root", {library: library});
    });

router.get("/book/:id([0-9]+)",
    (req, res, next) => {
        console.log(req.url);
        console.log(req.params.id);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "0");

        let requestedId = parseInt(req.params.id);

        if(requestedId !== undefined) {
            for (let elem of library) {
                if (elem.id === requestedId) {
                    res.render("book", elem);
                    return;
                }
            }
        }
        res.render("not_found");
    });

router.post("/book/:id([0-9]+)/take",
    (req, res) => {

        let requestedId = parseInt(req.params.id);
        let book;

        if((book = getBookById(requestedId)) !== undefined) {
            if(book.givenTo !== null) {
                res.render("not_found");
                return;
            }
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Expires", "0");
            book.givenTo = req.body.givenTo;
            book.returnDate = req.body.returnDate;
            /*book.returnDate = new Date(Date.parse(req.body.returnDate) -
                Date.prototype.getTimezoneOffset()*60*1000).toISOString().split("T")[0];*/
            res.render("book", book);
            return;
        }

        res.render("not_found");
});

router.post("/book/:id([0-9]+)/return",
    (req, res) => {
        let requestedId = parseInt(req.params.id);
        let book = getBookById(requestedId);
        if(book === undefined || book.givenTo === null) {
            res.render("not_found");
            return;
        }

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "0");
        book.givenTo = null;
        book.returnDate = null;
        res.render("book", book);
    });

router.post("/book/:id([0-9]+)",
    (req,res)=>{
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "0");
        let requestedId = parseInt(req.params.id);
        let book;

        if((book = getBookById(requestedId)) !== undefined) {
            book.title = (req.body.title.length ? req.body.title : `[Not specified]`);
            book.author = (req.body.author.length ? req.body.author : `[Not specified]`);
            book.year = req.body.year;
            book.language = (req.body.language.length ? req.body.language : `[Not specified]`);
            res.render("book", book);
            return;
        }

        res.render("not_found");
});

router.post("/book/:id([0-9]+)/delete",
    (req, res) => {
        console.debug("Deletion command!");

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "0");
        let requestedId = parseInt(req.params.id);
        let book;

        if((book = getBookById(requestedId)) !== undefined) {
            library.splice(book.id, 1);
        }

        for(let i = 0; i < library.length; ++i) {
            library[i].id = i;
        }

        res.render("root", {library: library});
    });

router.post("/",
    (req, res) => {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Expires", "0");

        let id = req.body.id;
        if(id !== undefined) {
            let idNumber = parseInt(id);
            if(getBookById(idNumber) !== undefined) {
                library.splice(idNumber, 1);
                res.render("root", {library: library});
                return;
            }
            res.render("not_found");
            return;
        }

        library.push({
            id: library.length,
            title: (req.body.title.length ? req.body.title : `[Not specified]`),
            author: (req.body.author.length ? req.body.author : `[Not specified]`),
            year: req.body.year,
            language: (req.body.language.length ? req.body.language : `[Not specified]`),
            givenTo: null,
            returnDate: null
        });

        console.debug(library);

        res.render("root", {library: library});
    });

router.get("/sort/:sortType",
    (req, res) => {
        let sortType = req.params.sortType;
        console.debug(sortType);

        switch (sortType) {
            case "all":
                res.end(JSON.stringify(library));
                break;
            case "available":
                let available = [];
                for(let book of library) {
                    if(book.returnDate === null) available.push(book);
                }
                res.end(JSON.stringify(available));
                break;
            case "expired":
                //let todayDate = (new Date()).getTime();
                let todayDate = Date.parse(new Date().toDateString());
                let expired = [];
                for(let book of library) {
                    if(book.returnDate !== null && Date.parse(book.returnDate) < todayDate) {
                        expired.push(book);
                    }
                }
                res.end(JSON.stringify(expired));
                break;
            default:
                res.end(JSON.stringify([]));
        }
    });

router.get("*",
    (req, res) => {
        res.status(404);
        res.render("not_found");
    });

function getBookById(idNumber) {
    for(let elem of library) {
        if(idNumber === elem.id) {
            return elem;
        }
    }
    return undefined;
}

module.exports = router;