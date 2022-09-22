window.onload = () => {
    const socket = io("http://localhost:3000");
    const formEntrada = document.querySelector("#formEntrada");
    const corpoApp = document.querySelector("#corpoapp");
    const corpo = document.querySelector("body");
    let userObjMaster = null;

    formEntrada.addEventListener("submit",e=> {
        e.preventDefault();

        let username = formEntrada.children[0].value;

        if(username.length > 0){
            socket.emit("EntradaNome", username);
            formEntrada.classList.add("text-center");
            formEntrada.innerHTML = `<div class="spinner-border text-info" role="status"><span class="visually-hidden">Loading...</span></div>`
        }
    });

    socket.on("EntradaSucesso", resposta => {
        userObjMaster = resposta.user;
        MontarChat(resposta.user, resposta.lista);
    });

    socket.on("EntradaErro", (erro) => {
        AlertError(erro);
        formEntrada.classList.remove("text-center");
        formEntrada.innerHTML = `
            <input type="text" class="form-control my-2 py-3" name="username" placeholder="Digite seu nome para entrar " required>
            <button class="btn btn-primary my-2" style="width: 100%;" type="submit">ENTRAR</button>
        `;
    });

    function AlertError(erro){
        let alert = document.createElement("span");
        alert.className = "alert alert-danger alert-msg";
        alert.textContent = erro;
        corpo.appendChild(alert);
        let alertTime = setInterval(() => {
            alert.remove();
            clearInterval(alertTime);
        }, 3500);
    }

    function MontarChat(user,listaMsgs){
        document.querySelector("#nav-pres").textContent = "SL chat | @"+user.username;
        corpoApp.innerHTML = `<h4 class="text-center p-0 m-0">Mensagens</h4>`;

        let mensagensHtml = document.createElement("div");
        mensagensHtml.className = "container border border-1 p-2 my-2 messages";
        corpoApp.appendChild(mensagensHtml);
        
        let form = document.createElement("form");
        form.className = "form-control form-app";
        
        let textArea = document.createElement("textarea");
        textArea.className = "form-control entrada-msg";
        textArea.type = "text";
        textArea.placeholder = "Digite sua mensagem...";
        form.appendChild(textArea);

        let btnEnviar = document.createElement("button");
        btnEnviar.type = "submit";
        btnEnviar.textContent = "ENVIAR"
        btnEnviar.className = "btn btn-primary btnEnviar";
        form.appendChild(btnEnviar);

        form.addEventListener("submit", e =>{
            e.preventDefault();

            let msg = textArea.value;
        
            if(msg.length > 0){
                let mensagemObj = {
                    author: "@"+user.username,
                    id: user.id,
                    message: msg,
                }
                socket.emit("enviarMensagem",mensagemObj);
                textArea.value = "";
                RenderizarMensagem(mensagemObj);
            }
        });

        corpoApp.appendChild(form);

        listaMsgs.forEach(msgObj => {
            RenderizarMensagem(msgObj);
        });
    }

    function RenderizarMensagem(mensagem){
        let caixaMensagens = document.querySelector(".messages");
        let div = document.createElement("div");
        if(mensagem.id === userObjMaster.id) div.className = "msg me";
        else div.className = "msg";
        div.innerHTML = "<b>"+mensagem.author+"</b>: "+ mensagem.message;
        if(caixaMensagens) caixaMensagens.appendChild(div);
    }
 
    socket.on("NovaMensagem", msg => {
        RenderizarMensagem(msg);
    });
}


// const chat = document.querySelector("#chat");
//     const caixaMensagens = document.querySelector("#msgs");
//     chat.addEventListener("submit", e => {
//         e.preventDefault();
    
//         let autor = document.querySelector("#autor").value;
//         let msg = document.querySelector("#msg").value;
    
//         if(autor.length > 0 && msg.length > 0){
//             let mensagemObj = {
//                 author: "@"+autor,
//                 message: msg,
//             }
//             socket.emit("enviarMensagem",mensagemObj);
//             RenderizarMensagem(mensagemObj);
//         }
//     });
    
//     socket.on("NovaMensagem", msg => {
//         RenderizarMensagem(msg);
//     });
    
//     socket.on("AtualizarListaMensagens",lista => {
//         lista.forEach(msg => RenderizarMensagem(msg));
//     })
    
//     function RenderizarMensagem(mensagem){
//         let div = document.createElement("div");
//         div.innerHTML = "<strong>"+mensagem.author+"</strong>: "+mensagem.message;
//         caixaMensagens.appendChild(div);
//     }