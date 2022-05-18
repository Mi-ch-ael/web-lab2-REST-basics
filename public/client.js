console.debug("Client scripts loaded");

function handleRequest(sortType) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if(this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
            refreshList(JSON.parse(this.responseText));
        }
    }
    xhttp.open("GET", `/sort/${sortType}`, true);
    //xhttp.send(JSON.stringify({sortType: sortType}));
    xhttp.send();
}

function refreshList(displayed) {
    //let displayed = answer.displayed;
    let books = document.getElementById("libraryList").children;

    let j = 0;
    for(let i = 0; i < displayed.length; ++i) {
        let id = displayed[i].id;
        while(j < id) {
            books[j].hidden = true;
            ++j;
        }
        books[j].hidden = false;
        ++j;
    }

    while(j < books.length) {
        books[j].hidden = true;
        ++j;
    }
}