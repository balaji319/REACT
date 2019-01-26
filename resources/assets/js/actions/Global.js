import axios from 'axios';

import {

 REQUEST_ALL_CAMPAIN_GLOBEL ,
 FETCH_ALL_CAMPAIN_GLOBEL_SUCSESS,
 FETCH_ALL_CAMPAIN_GLOBEL_FAIL


  
} from '../constants/ActionTypes';



import {globleService} from '../services/' 



// call redusers action  agents groups 

export const fetchCampaignSucsess = ( res ) => {
    return {
        type: FETCH_ALL_CAMPAIN_GLOBEL_SUCSESS,
        result: res.data
    };
}

export const fetchCampaignFail = ( res ) => {
    return {
        type: FETCH_ALL_CAMPAIN_GLOBEL_FAIL
    };
}

export const request_campain = ( res ) => {
    return {
        type: REQUEST_ALL_CAMPAIN_GLOBEL,

    };
}


export const  fetchGlobal = ( data ) => {

    return (dispatch, getState) => {
       dispatch(request_campain());
       globleService.getAllCampains(data)
                    .then(res => {
                        dispatch(fetchCampaignSucsess(res));
                    })
                    .catch(function(error) {
                        //dispatch(fetchCampaignFail(res));
                    })
    }
};









