var express = require("express")
var app = express()
const PORT = process.env.PORT || 3000;
var path = require("path")
var hbs = require('express-handlebars');
var formidable = require('formidable');
var fs = require('fs');

var filesContainer = [];
var id = 1;

app.use(express.static('static'))
app.use(express.urlencoded({
    extended: true
}));

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
}));
app.set('view engine', 'hbs');

app.get("/", function (req, res) {
    res.render('index.hbs');
})

app.post('/handleFiles', function (req, res) {

    let form = formidable({});

    form.uploadDir = __dirname + '/static/upload/'       // folder do zapisu zdjęcia
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {

        console.log("----- przesłane pola z formularza ------");

        console.log(fields);

        console.log("----- przesłane formularzem pliki ------");

        var extensions = ["gif", "jpeg", "jpg", "png", "mp3", "mp4", "pdf", "txt"]
        if (Array.isArray(files.file)) {
            files.file.forEach(element => {
                let fileObj = new Object;
                fileObj.id = id;
                id++;
                fileObj.name = element.name
                fileObj.path = element.path
                fileObj.size = element.size
                fileObj.type = element.type
                fileObj.savetime = Date.parse(element.lastModifiedDate)
                let ex = element.name.slice(element.name.indexOf('.') + 1)
                if (extensions.includes(ex))
                    fileObj.image = ex
                else
                    fileObj.image = "unknown"
                filesContainer.push(fileObj)
            });
        } else {
            let fileObj = new Object;
            fileObj.id = id;
            id++;
            fileObj.name = files.file.name
            fileObj.path = files.file.path
            fileObj.size = files.file.size
            fileObj.type = files.file.type
            fileObj.savetime = Date.parse(files.file.lastModifiedDate)
            let ex = files.file.name.slice(files.file.name.indexOf('.') + 1)
            console.log("EX:" + extensions.includes(ex))
            if (extensions.includes(ex)) {
                console.log("TAK")
                fileObj.image = ex
            }
            else {
                fileObj.image = "unknown"
            }
            filesContainer.push(fileObj)
        }
        console.log(filesContainer)
        //res.redirect('/')
        res.send("Pliki zostały przesłane pomyślnie.")

    });
});

app.get("/filemanager", function (req, res) {
    let context = {
        files: filesContainer
    }
    res.render('filemanager.hbs', context);
})

app.get("/info", function (req, res) {
    if (req.query.id) {
        for (let i = 0; i < filesContainer.length; i++) {
            if (filesContainer[i].id == req.query.id) {
                var info = {
                    id: filesContainer[i].id,
                    name: filesContainer[i].name,
                    path: filesContainer[i].path,
                    size: filesContainer[i].size,
                    type: filesContainer[i].type,
                    savetime: filesContainer[i].savetime
                }
                break;
            }
        }
        res.render('info.hbs', info);
    } else {
        res.render('info.hbs');
    }
})

app.get("/download/:id", function (req, res) {
    let id = req.params.id
    let filePath, fileName;
    for (let i = 0; i < filesContainer.length; i++) {
        if (filesContainer[i].id == id) {
            filePath = filesContainer[i].path;
            fileName = filesContainer[i].name;
            break;
        }
    }
    console.log(filePath)
    res.download(filePath, fileName, function(err) {
        if(err) {
            console.log(err);
            res.end();
        }
    })
})

app.get("/delete/:id", function (req, res) {
    let id = req.params.id
    for (let i = 0; i < filesContainer.length; i++) {
        if (filesContainer[i].id == id) {
            filesContainer.splice(i, 1)
            break;
        }
    }
    res.redirect("/filemanager")
})

app.get("/clear", function (req, res) {
    filesContainer = []
    res.redirect("/filemanager")
})

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})