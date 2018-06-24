import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

import { Auth } from "aws-amplify";

import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import googleIcon from "../assets/google.svg";
import facebookIcon from "../assets/facebook.svg";

import config from "./../config";

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

  handleFacebookSignIn = async response => {
    try {
      const { accessToken, expiresIn } = response;
      const date = new Date();
      const expires_at = expiresIn * 1000 + date.getTime();
      if (!accessToken) {
        return;
      }
      const fb = window.FB;
      fb.api("/me", response => {
        const user = {
          name: response.name
        };

        Auth.federatedSignIn(
          "facebook",
          { token: accessToken, expires_at },
          user
        ).then(credentials => {
          this.props.userHasAuthenticated(true);
        });
      });
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
            clientId={config.GOOGLE_CLIENT_ID}
            buttonText="Login using Google"
            onSuccess={this.handleGoogleSignIn}
            render={renderProps => (
              <img
                className="googleLogin"
                src={googleIcon}
                alt="google login"
                onClick={renderProps.onClick}
              />
            )}
          />
          <FacebookLogin
            appId={config.FACEBOOK_APP_ID}
            callback={this.handleFacebookSignIn}
            render={renderProps => (
              <img
                className="facebookLogin"
                src={facebookIcon}
                alt="facebook login"
                onClick={renderProps.onClick}
              />
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
