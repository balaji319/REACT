
import axios from 'axios';

import {

    REQUEST_ADMINU_FILTER_LIST,
	FETCH_ALL_ADMIN_FILTER_LIST_SUCSESS,
    ADD_ADMIN_FILTER_LIST_REQUEST,
    ADD_ADMIN_FILTER_LIST_SUCSESS,
    GET_ADMIN_FILTER_LIST_SUCSESS

} from '../constants/';


import {filterlistService} from '../services/'



// call redusers action  agents 


export const request_filterlist = ( res ) => { return { type: REQUEST_ADMINU_FILTER_LIST}}

export const fetchfilterlistSucsess = ( res ) => {return {type: FETCH_ALL_ADMIN_FILTER_LIST_SUCSESS, result: res.data}}

export const request_addfilterlist = ( res ) => { return { type: ADD_ADMIN_FILTER_LIST_REQUEST}}

export const fetchAddfilterlistSucsess = ( res ) => {return {type: ADD_ADMIN_FILTER_LIST_SUCSESS,result: res.data}}

export const fetchFilterSucsess = ( res ) => {return {type: GET_ADMIN_FILTER_LIST_SUCSESS,result: res.data}}


export const fetchAllFilterLists= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_filterlist(res));
       filterlistService.getAllFilterLists()
                    .then(res => {
                        dispatch(fetchfilterlistSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};


export const fetchfilterlist= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_filterlist(res));
       filterlistService.getFilterList(res)
                    .then(res => {
                        dispatch(fetchFilterSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};



export const addfilterlist= ( res ) => {
    return (dispatch, getState) => {
       dispatch(request_addfilterlist(res));
       filterlistService.addFilterList(res)
                    .then(res => {
                        dispatch(fetchAddfilterlistSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};