import React from 'react';
import   './style.css';
import IntlMessages from '../../../../../util/IntlMessages';
import CardBox from '../../../../../components/CardBox';
import TextField from '@material-ui/core/TextField';
class TextFields extends React.Component {

    render() {


        return (

            <div className="row mb-md-4">
                        <CardBox styleName="col-lg-8" >

            <form className="row" noValidate autoComplete="off">
        
       
               


                <div className="col-12">
                
                    <div className="form-row">
                                  <div className="col-md-4 col-12">
                    <TextField
                        id="name"
                        label="Name"

                        margin="normal"
                        fullWidth
                    />
                </div>
                <div className="col-md-4 col-12">
                    <TextField
                        id="uncontrolled"
                        label="Uncontrolled"
                        defaultValue="foo"
                        margin="normal"
                        fullWidth
                    />
                </div>
                <div className="col-md-4 col-12">
                    <TextField
                        required
                        id="required"
                        label="Required"
                        defaultValue="Hello World"
                        margin="normal"
                        fullWidth
                    />
                </div>
                    </div>
                </div>
            </form>
                        </CardBox>
                 
            <div className="col-lg-4" style={{display: 'grid'}}>

             <div className="jr-card ">

                 <div className="jr-card-body ">

                 

                         <div className="col-md-12 col-12 mt-12">

                               

                        <div>
                        <div className="card-body">

                        <h3 className="card-title">Card Title</h3>

                        <p class="card-text">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.</p>

                        </div>
                      
                        </div>

                        </div>

                
                    </div>
                </div>

             </div>





                    </div>























        );
    }
}


export default TextFields;