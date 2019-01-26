import React from 'react';

const TextError = ({Type, msg}) => {

    return (
      <div  className={`alert ${Type}`}  style={{padding: '5px !important', margin: '4px 0px 4px 0px !important'}}>
        <button type="button" data-dismiss="alert" className="close">
          <i className="entypo-cancel" /></button>
             <div> {msg}</div> 
      </div>

    )
};
export default TextError;

TextError.defaultProps = {
    Type: "",
    msg: "",
};


