function getData() {
    let name = document.getElementById("input-nama").value
    let email = document.getElementById("input-email").value
    let phone = document.getElementById("input-phone").value
    let subject = document.getElementById("input-subject").value
    let message = document.getElementById("input-message").value


    if (name == "") {
        return alert("WARNING !!! \nNama tidak boleh kosong")
    } else if (phone == "") {
        return alert("WARNING !!! \nphone tidak boleh kosong")
    } else if (email == "") {
        return alert("WARNING !!! \nemail tidak boleh kosong")
    } else if (subject == "") {
        return alert("WARNING !!! \nsubject tidak boleh kosong")
    } else if (message == "") {
        return alert("WARNING !!! \nmessage tidak boleh kosong")
    }

    let receiverMail = "muhamadsubkhan99@gmail.com"
    let a = document.createElement("a")
  
    a.href = `mailto: ${receiverMail}?subject=${subject}&body=Hello my name ${name}, ${subject}, let's talks with me asap`
    a.click()
}