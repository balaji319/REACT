

export const updateObject = (oldObject, updatedValues) => {
    return {
        ...oldObject,
        ...updatedValues
    }
};


// Custom Update
export const updateRecordStatusScripts = ( state, action ) => {

      const updatedRecordArray =  state.data.map(	(data, i) =>  data.script_id === action.result.script_id ? {...data, active: action.result.active}: data );

  	  return updateObject(state, {isLoading: false, Response:action.result,data:action.result.data,showMessage: true,alertMessage: action.result.msg,status : action.result.status});

   //return  updateObject(state, {isLoading: false,data:updatedRecordArray,showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});

};
export const updateRecordStatusScript = ( state, action ) => {

    const updatedRecordArray =  state.data.map((data, i) =>  data.script_id === action.result.script_id ? {...data, active: action.result.active}: data );

      return updateObject(state, {isLoading: false, Response:action.result,data:updatedRecordArray,showMessage: true,alertMessage: action.result.msg,status : action.result.status});

 //return  updateObject(state, {isLoading: false,data:updatedRecordArray,showMessage: true,alertMessage: 'Record Updated Susessfully' ,status : true,alertMessageTitle:'Success'});

};



