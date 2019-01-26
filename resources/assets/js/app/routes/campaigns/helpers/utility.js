export const updateObject = (oldObject, updatedValues) => {
  return {
    ...oldObject,
    ...updatedValues
  };
};

// Custom Delete
export const deleteInboundRecord = (state, action) => {
  console.log("++++++++++++++++++++");
  console.log(state);
  console.log("++++++++++++++++++++");
  console.log(action);
  const updatedArray = state.data.data.filter(
    data => data.campaign_id !== action.result.campaign_id
  );
  return updateObject(state, {
    isLoading: false,
    Response: action.result,
    alertMessageTitle: "Success",
    showMessage: true,
    alertMessage: "Record Deleted Susessfully",
    status: true,
    data: updatedArray
  });
};
