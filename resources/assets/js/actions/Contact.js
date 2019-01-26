import {
    ADD_FAVOURITE,
    FETCH_ALL_CONTACT,
    FETCH_ALL_CONTACT_SUCCESS,
    FILTER_CONTACT,
    GET_ALL_CONTACT,
    GET_UNSELECTED_ALL_CONTACT,
    HANDLE_REQUEST_CLOSE,
    HIDE_CONTACT_LOADER,
    ON_ADD_CONTACT,
    ON_ALL_CONTACT_SELECT,
    ON_CONTACT_CLOSE,
    ON_CONTACT_SELECT,
    ON_DELETE_CONTACT,
    ON_DELETE_SELECTED_CONTACT,
    ON_FILTER_OPTION_SELECT,
    ON_SAVE_CONTACT,
    ON_TOGGLE_DRAWER,
    SHOW_MESSAGE,
    UPDATE_SEARCH_USER
} from '../constants/ActionTypes';


export const fetchCampaigns = () => {
    return {
        type: FETCH_ALL_CONTACT
    };
};

export const fetchContactsSuccess = (contact) => {
    return {
        type: FETCH_ALL_CONTACT_SUCCESS,
        payload: contact
    }
};
