
import axios from 'axios';
import {  push } from 'react-router-redux'

import {

    REQUEST_ADMINU_CALL_TIME,
	FETCH_ALL_ADMIN_CALL_TIME_SUCSESS,
    ADD_ADMIN_CALL_TIME_REQUEST,
    ADD_ADMIN_CALL_TIME_SUCSESS,
    GET_ADMIN_CALL_TIME_SUCSESS


} from '../constants/';


import {calltimeService} from '../services/'



// call redusers action  agents 


export const request_calltime = ( res ) => { return { type: REQUEST_ADMINU_CALL_TIME}}

export const fetchCalltimeSucsess = ( res ) => {return {type: FETCH_ALL_ADMIN_CALL_TIME_SUCSESS, result: res.data}}

export const request_addcalltime = ( res ) => { return { type: ADD_ADMIN_CALL_TIME_REQUEST}}

export const fetchAddcalltimeSucsess = ( res ) => {return {type: ADD_ADMIN_CALL_TIME_SUCSESS,result: res.data}}

export const fetchGetCalltimeSucsess = ( res ) => {return {type: GET_ADMIN_CALL_TIME_SUCSESS,result: res.data}}


export const fetchAllcalltimes= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_calltime(res));
       calltimeService.getAllCallTimes()
                    .then(res => {
                        dispatch(fetchCalltimeSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};


export const fetchcalltime= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_calltime(res));
       calltimeService.getCallTime(res)
                    .then(res => {
                        dispatch(fetchGetCalltimeSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};



export const addcalltime= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_addcalltime(res));
       calltimeService.addCallTime(res)
                    .then(res => {
                        dispatch(fetchAddcalltimeSucsess(res));

                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};