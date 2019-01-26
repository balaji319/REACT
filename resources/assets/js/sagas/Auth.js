/*
# Auth Redux Sagas 
# Copyright (C) Ytel 2018 Balaji Pastapure<balaji@ytel.co.in>    
# This script is designed as an Auth User  
# 
*/

/* import all packages */
import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';

import {authService} from '../services/auth' 

import {
    SIGNIN_USER,
    SIGNOUT_USER,
    SIGNUP_USER
} from '../constants/ActionTypes';
import { showAuthMessage, userSignInSuccess, userSignOutSuccess, userSignUpSuccess } from '../actions/Auth';


/* import all packages */
const createUserWithEmailPasswordRequest = async (email, password) => await  authService.createUserWithEmailAndPassword(email, password)
        .then(authUser => authUser)
        .catch(error => error);

const signInUserWithEmailPasswordRequest = async (email, password) => await authService.auth_login({username:email, password})
        .then(authUser => authUser)
        .catch( error => error);

const signOutRequest = async () => await  authService.signOut()
        .then(authUser => authUser)
        .catch(error => error);


/**
* createUserWithEmailPassword
* @param  payload 
* @param  [string] username 
* @param  [string] email
* @param  [string] other 
* @return [string] message
* 
*/
function* createUserWithEmailPassword({payload}) {

    const {email, password} = payload;
    try {
        const signUpUser = yield call(createUserWithEmailPasswordRequest, email, password);
        if (signUpUser.message) {
            yield put(showAuthMessage(signUpUser.message));
        } else {
            localStorage.setItem('x5_contact_id', signUpUser.user_data.x5_contact_id);
            localStorage.setItem('user_id', signUpUser.user_data.username);
            yield put(userSignUpSuccess(signUpUser));
        }
    } catch (error) {
        yield put(showAuthMessage(error));
    }
}

/**
* signInUserWithEmailPassword
* @param  payload 
* @param  [string] username 
* @param  [string] password
* @return [string] message
* 
*/
function* signInUserWithEmailPassword({payload}) {
    const {email, password} = payload;
    try {

    const signInUser = yield call(signInUserWithEmailPasswordRequest, email, password);
    console.log(signInUser);
       if(signInUser.response){
            yield put(showAuthMessage(signInUser.response.data.msg));

        } else  {

           localStorage.setItem('x5_contact_id', signInUser.data.user_data.x5_contact_id);
           localStorage.setItem('user_id', signInUser.data.user_data.username);
           localStorage.setItem('access_token', signInUser.data.access_token);
           localStorage.setItem('company_id', signInUser.data.user_data.company_id);
           localStorage.setItem('db_last_used', signInUser.data.user_data.db_last_used);
           localStorage.setItem("db_details", JSON.stringify(signInUser.data.user_data.db_details));
           //set default auth token 
            axios.defaults.headers.common['Content-Type'] = 'application/json'
            axios.defaults.headers.common['Authorization'] = 'Bearer '+ signInUser.data.access_token  
           //localStorage.setItem('company_id', signUpUser.data.user_data.company_id);
            yield put(userSignInSuccess(signInUser));
        }
    } catch (error) {

        yield put(showAuthMessage('Something went wrong !!!!  '));
    }
}

/**
* signOut
* @param  non  
* @return [string] message
* destroy local storage 
* 
*/
function* signOut() {
    try {
        const signOutUser = yield call(signOutRequest);
        //const signOutUser =true;
        if (!signOutUser) {
            yield put(showAuthMessage(signOutUser.message));
        } else {
            localStorage.removeItem('user_id');
            localStorage.removeItem('access_token');
            localStorage.removeItem('db_details');
            localStorage.removeItem('selected_db');
            localStorage.removeItem('x5_contact_id');   
            localStorage.removeItem('company_id');             
            yield put(userSignOutSuccess(signInUser));
        }
    } catch (error) {
        yield put(showAuthMessage(error));
    }
}

/*
*
* ES 6 generators for all above  
* 
*/

export function* createUserAccount() { yield takeEvery(SIGNUP_USER, createUserWithEmailPassword);}

export function* signInUser() { yield takeEvery(SIGNIN_USER, signInUserWithEmailPassword); }

export function* signOutUser() { yield takeEvery(SIGNOUT_USER, signOut); }

/*
*
* Export all 
* 
*/



/*
*
* Export all 
* 
*/
export default function* rootSaga() {
    yield all([fork(signInUser),
        fork(createUserAccount),
        fork(signOutUser)]);
}