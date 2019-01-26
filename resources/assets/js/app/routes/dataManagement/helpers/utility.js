export const updateObject = (oldObject, updatedValues) => {
    return {
        ...oldObject,
        ...updatedValues
    }
};

// Custom Delete 
export const deleteInboundRecord= ( state, action ) => {
     const updatedArray = state.data.filter( data => data.group_id !== action.result.id );
     return  updateObject(state, {isLoading: true, Response:action.result, alertMessageTitle:'Success' ,showMessage: true,alertMessage: 'Record Deleted Susessfully' ,status : true ,data: updatedArray});
};

// Custom Update 
export const updateRecordStatus = ( state, action ) => {

	
      const updatedRecordArray =  state.data.map(	(data, i) =>  data.user_id === action.result.user_id ? {...data, active: action.result.active}: data );
   return  updateObject(state, {isLoading: false,data:updatedRecordArray,showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});
   
};

// Custom Update 
export const updateRecordcloser = ( state, action ) => {

    const updatedRecordArray =  state.data.map(	(data, i) =>  data.user_id === action.result.user_id ? {...data, closer_default_blended: action.result.closer_default_blended }: data );
   return  updateObject(state, {isLoading: false,data:updatedRecordArray,showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});
   
};


