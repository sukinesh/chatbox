//---------------IMPORTING FIREBASE & FIRESTORE-----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
// Config of firebase from old account
const firebaseConfig = {                                 
    apiKey: "AIzaSyA476S6cm6tpnEEQJLL6L9jLLz4afotATI",
    authDomain: "apis-and-miscs.firebaseapp.com",
    projectId: "apis-and-miscs",
    storageBucket: "apis-and-miscs.appspot.com",
    messagingSenderId: "471743871347",
    appId: "1:471743871347:web:d85fbd1ecac94496d76d06"
};
// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
import {getFirestore, doc, getDoc, addDoc, getDocs,setDoc,collection,updateDoc,query,orderBy, limit ,where, deleteDoc, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import {getAuth,  onAuthStateChanged, signOut , updateProfile ,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {getStorage, ref , uploadBytesResumable, getDownloadURL , deleteObject} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

export const firestore = getFirestore(firebase,"chatbox");
const auth = getAuth(firebase);
const storage = getStorage(firebase);

// ------------------------------------------AUTH--------------------------------------------------
//check auth state and navigate page
export function checkAuth()
{   
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user =>{
            if(user)
            {
                // console.log(user);
                resolve(user);
                // location.href = "../home.html"
            }
            else
            {
                // console.log('logged out');
                resolve('no user')
                location.href = "../login"
            }
            // unsubscribe();
        });
    })
}

export function firebaseSignOut(){
    signOut(auth);
}

// ------------------------------------DATABASE-------------------------------------------------
export async function firestoreGetData(path, docName){
    // Loading(true);
    let data_snap = await getDoc(doc(firestore,path,docName));
    // Loading(false);
    return data_snap.data();
}


export async function CheckDB(path,mobile) {
    let present;
    let doc_ref = doc(firestore, path, mobile);

    await getDoc(doc_ref).then((doc) => {
        if (doc.exists()) present = true;
        else present = false;
    });
    return present;
}

export async function AddToDB(data, col_name) {
    //console.log(form_data);
    let col_ref = collection(firestore, col_name);
    const doc_ref = await addDoc(col_ref, data)
        .then(() => {
            console.log("data added");
        })
        .catch((error) => {
            console.log(error);
        });
}

export async function SetToDB(data,data_base,doc_name) {
    let doc_ref = doc(firestore, data_base, doc_name);
    await setDoc(doc_ref, data)
        .then(() => {
            console.log("data Set");
        })
        .catch((error) => {
            console.log(error);
        });
}

export async function UpdateToDB(data, path, doc_name) {
    let doc_ref = doc(firestore, path, doc_name);
    await updateDoc(doc_ref, data)
    .then(() => {
        console.log("data Updated");
    })
    .catch((error) => {
        console.log(error);
    });
}

export async function DeleteFromDB(path, doc_name) {
    let doc_ref = doc(firestore, path, doc_name);
    await deleteDoc(doc_ref)
    .then(() => {
        console.log("data deleted");
    })
    .catch((error) => {
        console.log(error);
    });
}

export async function queriedData(data_type,col_path,whereField,whereOpp,whereValue,order,orderDir,limitVal){
    // let db_query = query(collection(firestore, user_email+'/'+current_branch+'/calcs'));
    // console.log(col_path,whereField,whereOpp,whereValue);
    let data = [];
    // const collection = new Function(col_path);
    // const query_string = new Function(query_par);
    let db_query;
    if(whereField != undefined && whereField != '')
        db_query = query(collection(firestore, col_path),where(whereField,whereOpp,whereValue));
    else if(order != undefined && limit != undefined)
        db_query = query(collection(firestore, col_path),orderBy(order,orderDir),limit(limitVal));
    else
        db_query = query(collection(firestore, col_path));
    if(data_type == 'data')
    {
        const data_snap = await getDocs(db_query);
        data_snap.forEach((doc)=>{
            data[doc.id] = doc.data()
        });
        return data;
    }
    else if(data_type == "count")
    {
        const count_snapshot = await getCountFromServer(db_query);
        const count = count_snapshot.data().count;
        return count;
    
    }
    else if(data_type == 'query')
    {
        return db_query;   
    }
}

// -----------------------------------STORAGE----------------------------------------
export async function fileUpload(file_loc,file)
{
  // Loading(true);
    const storageRef = ref(storage, file_loc);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve,reject)=>{
    uploadTask.on('state_changed', 
    (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        Progress(true,progress);
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
        case 'paused':
            console.log('Upload is paused');
            break;
            case 'running':
            console.log('Upload is running');
            break;
            }
            
        }, 
        (error) => {
            Progress(false);
            console.log(error);
    }, 
    () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        console.log('File available at', downloadURL);
        Toast('File Uploaded Successfully');
        resolve(downloadURL);
        Progress(false);
        });
        // Loading(false);
    });
    });
}

export async function StorageUrl(path){
    const url = getDownloadURL(ref(storage, path));
    return url;
}

export async function deleteStorage(path){
    const result = deleteObject(ref(storage,path));
    return result;
}
