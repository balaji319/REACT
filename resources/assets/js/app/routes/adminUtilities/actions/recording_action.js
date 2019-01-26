
import axios from 'axios';

import {

    REQUEST_ADMINU_RECORDINGS,
    FETCH_ALL_ADMIN_RECORDINGS_SUCSESS

} from '../constants/';


import {recordingService} from '../services/'



// call redusers action  agents


export const request_recordinglist = ( res ) => { return { type: REQUEST_ADMINU_RECORDINGS}}

export const fetchrecordingSucsess = ( res ) => {return {type: FETCH_ALL_ADMIN_RECORDINGS_SUCSESS, result: res.data}}




export const fetchRecordingLists= ( data ) => {
    return (dispatch, getState) => {
       dispatch(request_recordinglist());
       recordingService.getAllRecordingLists(data)
                    .then(res => {
                        dispatch(fetchrecordingSucsess(res));
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
    }
};

