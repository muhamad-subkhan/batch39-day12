const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const session = require("express-session")
const flash = require("express-flash")


const port = 8000;


const upload = require("./public/middleware/fileUpload")
const db = require("./public/connection/db")
const { request } = require("express")

app.set("view engine", "hbs") // set view engin hbs

app.use("/public", express.static(__dirname + "/public")) //static folder
app.use("/uploads", express.static(__dirname + "/uploads")) //static folder

app.use(express.urlencoded({
    extended: false
}))

app.use(flash())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000 // second in hours (2jam)
    }
}))





app.get("/", function (request, response) {
    // console.log(request.session);

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `SELECT tb_projects.id, title, start_date, end_date, description, technologies, image, user_id, name 
        FROM tb_projects 
        LEFT JOIN tb_users ON tb_projects.user_id = tb_users.id ORDER BY id  DESC`
        client.query(query, function (err, result) {
            done()
            if (err) throw err
            let dataProject = result.rows


            let filter
            if (request.session.user){
                filter = dataProject.filter(function(item){
                    return  item.user_id === request.session.user.id 
                })
            }

            let resultProject = request.session.user ? filter : dataProject

            Project = resultProject.map(function(item){
                item.technologies = item.technologies.map(function (teknologi) {
                    // if (teknologi != 'undefined') {
                    //     return teknologi;
                    // } else {
                    //      teknologi = undefined
                    // }
                  return  teknologi != 'undefined'? teknologi : undefined
                })  
                return{
                    ...item,
                    isLogin: request.session.isLogin,
                    duration: distanceTime(item.start_date, item.end_date)
                }
            }) 

            // console.log(data);
            console.log(request.session.isLogin);
            console.log(Project);
            response.render("index", {
                user: request.session.user,
                dataProject: Project,
                isLogin: request.session.isLogin
            }) 
        })
    })
})

app.get("/detail-project/:id", function (request, response) {
    let id = request.params.id


    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `SELECT * FROM tb_projects WHERE id=${id}`
        client.query(query, function (err, result) {
            done()
            if (err) throw err

            let data = result.rows
            let dataProject = data.map(function (items) {
                items.technologies = items.technologies.map(function (technology) {
                    // if (technology != 'undefined') {
                    //     return technology;
                    // } else {
                    //      technology = undefined
                    // }
                    return  technology != 'undefined' ? technology : undefined
                })
                return {
                    ...items,
                    duration: distanceTime(items.start_date, items.end_date),
                    start: fullTime(items.start_date),
                    end: fullTime(items.end_date)
                }
            })
            // console.log(dataProject);
            response.render("detail-project", {
                data: dataProject[0],
                isLogin: request.session.isLogin,
                user: request.session.user,
            })
        })
    })
})

app.get("/add-project", function (request, response) {
    if (!request.session.user){
        response.redirect("/login")
    }

    request.session.isLogin, response.render("project", {user: request.session.user, isLogin: request.session.isLogin})
})

app.post("/add-project", upload.single("inputImage"), function (request, response) {
    let data = request.body

    let {
        inputProject: title,
        inputStart: startDate,
        inputEnd: endDate,
        inputMassage: message,
        inputode: node,
        inputAngular: angular,
        inputReact: react,
        inputGolang: golang,
    } = data

    db.connect(function (err, client, done) {
        if (err) throw err
        

        const image = request.file.filename
        let userId = request.session.user.id
        let query = `INSERT INTO tb_projects (title, start_date, end_date, description, technologies, image, user_id) 
        VALUES ('${title}', '${startDate}', '${endDate}', '${message}', '{"${node}", "${angular}", "${react}", "${golang}"}', '${image}', '${userId}')`
        
        client.query(query, function (err, result) {
            done()
            if (err) throw err
        })
    })
    // console.log(query);

    response.redirect("/")
})

app.get("/delete/:id", function (request, response) {
    let id = request.params.id

    if (!request.session.user){
        response.redirect("/login")
    }


    db.connect(function (err, client, result) {
        if (err) throw err

        let query = `DELETE FROM public.tb_projects WHERE id=${id};`
        client.query(query, function (err, result) {
            if (err) throw err
        })
    })
    response.redirect("/")
})

app.get("/update/:id", function (request, response) {
    let id = request.params.id

    
    if (!request.session.user){
        response.redirect("/login")
    }

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `SELECT * FROM tb_projects WHERE id=${id}`

        client.query(query, function (err, result) {
            if (err) throw err

            let data = result.rows
            let dataProject = data.map(function (items) {
                items.technologies = items.technologies.map(function (technology) {
                    // if (technology != 'undefined') {
                    //     return technology;
                    // } else {
                    //     return technology = undefined
                    // }
                    return  technology != 'undefined'? technology : undefined
                })
                return {
                    ...items,
                    start: (items.start_date).toISOString().split('T')[0],
                    end: (items.end_date).toISOString().split('T')[0]
                }
            })

            // console.log(dataProject);
            response.render("update", {
                data: dataProject[0]
            })
        })
    })
})

app.post("/update/:id",upload.single("inputImage") , function (request, response) {
    let id = request.params.id

    db.connect(function (err, client, done) {
        if (err) throw err

        let data = request.body

        let {
            inputProject: title,
            inputStart: startDate,
            inputEnd: endDate,
            inputMassage: message,
            inputode: node,
            inputAngular: angular,
            inputReact: react,
            inputGolang: golang,
        } = data

        const image = request.file.filename
        let query = `UPDATE public.tb_projects
        SET title='${title}', start_date='${startDate}', end_date='${endDate}', description='${message}', technologies='{"${node}", "${angular}", "${react}", "${golang}"}', image='${image}'
        WHERE id=${id};`


        client.query(query, function (err, result) {
            done()
            if (err) throw err

            // console.log(result.rows[0])
        })
    })
    response.redirect("/")
})


app.get("/register", function (request, response) {
    response.render("register")
})

app.post("/register", function (request, response) {

    let data = request.body

    let {
        inputName: name,
        inputEmail: email,
        inputPassword: password
    } = data

    db.connect(function (err, client, done) {
        if (err) throw err

        let saltRound = 5
        let passwordHash = bcrypt.hashSync(password, saltRound)

        let query = `INSERT INTO tb_users(
            name, email, password)
            VALUES ('${name}', '${email}', '${passwordHash}');`

        client.query(query, function (err, result) {
            done()
            if (err) throw err
            // console.log(data);
        })
        response.redirect("/login")
    })
})

app.get("/login", function (request, response) {
    response.render("login")
})

app.post("/login", function (request, response) {

    let data = request.body

    let {
        inputEmail: email,
        inputPassword: password
    } = data

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `SELECT * FROM tb_users WHERE email = '${email}'`

        client.query(query, function (err, result) {
            done()
            if (err) throw err

            let dataLogin = result.rows

            if (dataLogin.length == 0) {
                // console.log("email belum terdaftar !!!")
                request.flash("error", "email belum terdaftar !!!")
                response.redirect("/login")
                return
            }

            let isMatch = bcrypt.compareSync(password, dataLogin[0].password)

            if (isMatch) {
                // console.log("login berhasil")

                request.session.isLogin = true;
                request.session.user = {
                    id: dataLogin[0].id,
                    name: dataLogin[0].name,
                    email: dataLogin[0].email
                }
                request.flash("succes", "Login berhasil")
                response.redirect("/")

            } else {
                // console.log("password salah")
                request.flash("error", "Password salah")
                response.redirect("/login")

            }

            // console.log(dataLogin[0]);
            // console.log(dataLogin.length);
            // console.log(isMatch);
        })
    })
})

app.get("/contact-me", function (request, response) {

    response.render("contact-me")
})


app.get("/logout", function (request, response) {
    request.session.destroy()

    response.redirect("/login")
})

function fullTime(times) {

    let time = new Date(times)

    let month = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ]
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let Year = time.getFullYear()

    return `${date} ${month[monthIndex]} ${Year}`
}






function distanceTime(startDate, endDate) {


    let start = new Date(startDate)
    let end = new Date(endDate)

    let duration = end - start

    //miliseconds  1000
    //second in hours 3600 
    // hours in day 23 (karena ketika sudah sampai jam 23.59 akan kembali ke 00.00)
    // day in month 31

    let distanceDay = Math.floor(duration / (1000 * 3600 * 23));
    let distanceMonth = Math.floor(distanceDay / 31);
    let distanceMore = Math.floor(distanceDay % 31 - 1)


    if (distanceMonth <= 0) {
        return distanceDay + " Hari"
    } else
        return distanceMonth + " Bulan " + distanceMore + " Hari"

}








app.listen(port, function () {
    console.log(`server berjalan pada port : ${port}`);
})