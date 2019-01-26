import Button from "@material-ui/core/Button";
import React from "react";

class ButtonNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollingLock: false
    };
    // example how to bind object in React ES6
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll() {
    alert("aaaa");

    if (window.scrollY > 100) {
      console.log("should lock");
      this.setState({
        scrollingLock: true
      });
    } else if (window.scrollY < 100) {
      console.log("not locked");
      this.setState({
        scrollingLock: false
      });
    }
  }

  render() {
    return (
      <div
        style={{
          width: "100%",
          position: this.state.scrollingLock ? "fixed" : "relative"
        }}
      >
        <div>
          <div className="col-lg-12" style={{ padding: "0px" }}>
            <div
              className="jr-card "
              style={{
                padding: "2px",
                textAlign: "right",
                marginBottom: "14px"
              }}
            >
              <div className="jr-card-body ">
                <div className="cardPanel teal">
                  <span className="whiteText">
                    <Button
                      variant="raised"
                      style={{
                        marginBottom: "4px",
                        marginRight: "26px",
                        background: "#2296f3 "
                      }}
                      className="jr-btn text-white"
                      onClick={this.props.click}
                    >
                      <i className="zmdi zmdi-mail-send zmdi-hc-fw" />
                      <span>Update</span>
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ButtonNav;
