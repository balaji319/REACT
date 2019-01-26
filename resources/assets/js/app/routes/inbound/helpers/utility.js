
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
export const updateInboundRecord = ( state, action ) => {
      const updatedRecordArray =  state.data.map(	(data, i) =>  data.group_id === action.result.group_id ? {...data, active: action.result.active}: data );
   return  updateObject(state, {isLoading: false,data:updatedRecordArray,showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});
   
};

