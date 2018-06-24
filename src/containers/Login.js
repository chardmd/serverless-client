import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

import { Auth } from "aws-amplify";

import GoogleLogin from "react-google-login";
import googleIcon from "../assets/google.svg";

import "./Login.css";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleGoogleSignIn = async response => {
    try {
      const { id_token, expires_at } = response.getAuthResponse();
      const profile = response.getBasicProfile();
      const user = {
        email: profile.getEmail(),
        name: profile.getName()
      };

      await Auth.federatedSignIn(
        "google",
        {
          token: id_token,
          expires_at
        },
        user
      );
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
    }
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.signIn(this.state.email, this.state.password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            buttonText="Login using Google"
            onSuccess={this.handleGoogleSignIn}
            render={renderProps => (
              <div className="googleLogin">
                <img src={googleIcon} {...renderProps} />
              </div>
            )}
          />
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            loadingText="Logging in…"
          />
        </form>
      </div>
    );
  }
}
