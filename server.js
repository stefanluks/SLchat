const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname,"public")));
app.set("views", path.join(__dirname,"public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine","html");

const PORT = process.env.PORT || 80;

app.use("/", (request, response) => {
    response.render("index.html");
});

let ListaMensagens = JSON.parse(fs.readFileSync('./mensagens.json'));
let listaUsers = [];

function CheckUsername(username){
    let saida = true;
    listaUsers.forEach(user => {
        if(user.username === username) saida = false;
    })
    return saida;
}

function GetUsersOnline(){
    let msg = 'usuarios online: ';
    listaUsers.forEach(user => { msg += user.username+" | ";})
    return msg;
}

io.on("connection", socket => {
    socket.on("EntradaNome", username => {
        if(CheckUsername(username)){
            let user = {
                username: username,
                id: socket.id,
            }
            listaUsers.push(user);
            
            let obj = {
                author: "#server",
                message: "O usuario "+username+" entrou...",
            }
            ListaMensagens.push(obj);
            socket.broadcast.emit("NovaMensagem",obj);

            fs.writeFileSync("./mensagens.json",JSON.stringify(ListaMensagens));

            socket.emit("EntradaSucesso", {user:user,lista:ListaMensagens});
        }else{
            socket.emit("EntradaErro", ("Usuario Invalido, alguém já está usando esse nome!"));
        }
    });

    socket.on("enviarMensagem", obj => {
        if(obj.message === "#@online"){
            socket.emit("NovaMensagem",{
                author: "#server",
                message: GetUsersOnline(),
            });
        }else{
            ListaMensagens.push(obj);
            socket.broadcast.emit("NovaMensagem",obj);
            fs.writeFileSync("./mensagens.json",JSON.stringify(ListaMensagens));
        }
    });

    socket.on("disconnect", () => {
        listaUsers.forEach((user,indice) => {
            if(user.id === socket.id){
                let obj = {author: "#server",message: "O usuario "+user.username+" Saiu..."};
    
                ListaMensagens.push(obj);
                socket.broadcast.emit("NovaMensagem",obj);
    
                fs.writeFileSync("./mensagens.json",JSON.stringify(ListaMensagens));
    
                listaUsers.splice(indice,1);
            }
        });
    });
});

server.listen(PORT);

console.log("-----------------------------------------");
console.log("| - - - - - - SERVER ONLINE - - - - - - |");
console.log("-----------------------------------------");
