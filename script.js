import { queriedData , AddToDB} from "./firebase.js";

import { firestore } from "./firebase.js";
import { doc, onSnapshot, collection, query,where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// const unsub = onSnapshot(doc(firestore, "chat", "SF"), (doc) => {
//     console.log("Current data: ", doc.data());
// });

const table = document.getElementById('history').querySelector('table');

const msgQuery = query(collection(firestore,'chat'),where("time", '>', new Date().setHours(0,0,0,0)),orderBy('time','desc'),limit(100));
// const msgQuery = query(collection(firestore,'chat'),orderBy('time','desc'),limit(2));
onSnapshot(msgQuery, (snapshot)=> {
    snapshot.docChanges().reverse().forEach((change)=>{
            // Handle added document
            if (change.type === "added") {
                const msg = change.doc.data();
                // Process the added document as needed
                const msgTime = new Date(msg.time);
                const row = document.createElement('tr');
                const name = document.createElement('td');
                name.innerText = `${msg.name} : ${msg.message}`;

                const time = document.createElement('td');
                time.innerText = msgTime.toLocaleTimeString();
                row.append(name,time);

                table.appendChild(row);
                console.log( new Date(msgTime).getTime());

                const history = document.getElementById('history');
                history.scrollTop = history.scrollHeight;
            }
        
    });
});


const populateHistory = async ()=>{

    const query = await queriedData('data',"chat",'','','','time','desc',20);
    const table = document.getElementById('history').querySelector('table');



    // for (let i = Object.values(data).length -1; i >= 0 ; i--) {
    //     const msg = Object.values(data)[i];
        
    //     const msgTime = new Date(msg.time.seconds*1000);
    //     const row = document.createElement('tr');
    //     const name = document.createElement('td');
    //     name.innerText = `${msg.name} : ${msg.message}`;
    //     // const message = document.createElement('td');
    //     // message.innerText = msg.message;
    //     const time = document.createElement('td');
    //     time.innerText = msgTime.toLocaleTimeString();
    //     row.append(name,time);

    //     table.appendChild(row);
    //     // console.log(msg.name, msg.message);
    //     // console.log(msgTime);
    // };
}



let username = localStorage.getItem('username');
if(username == null)
{
    console.log('empty');
    document.getElementById('user_container').style.display = "block";
}
else
{
    console.log(username); 
    document.getElementById('user_id').innerText= username;
    populateHistory().then(()=>{
        const history = document.getElementById('history');
        history.scrollTop = history.scrollHeight;

    });
}





const form = document.getElementById('input').querySelector('form');
const input = form.querySelector('#msg_field');
form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    console.log(username,input.value,new Date());
    if(input.value == '') 
        return; 
    const msg = {
        name : username,
        message : input.value,
        time : new Date().getTime()
    };
    input.value = '';
    await AddToDB(msg, 'chat');
})

const userForm = document.getElementById('user_form');
userForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    username = userForm.querySelector('input').value;
    localStorage.setItem('username', username);
    document.getElementById('user_container').style.display = "none";

})

