const registerCheck = document.querySelector('#registerCheck');
const registerButton = document.querySelector('#registerButton');

registerCheck.addEventListener('click', () => {
    if(!registerCheck.checked){
        registerButton.disabled = true;
    }else{
        registerButton.disabled = false;
    }
});

function JSalert(){
 
swal("Congrats!", ", Your account is created!", "success");
 
}

