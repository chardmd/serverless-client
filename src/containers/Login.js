import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

import { Auth } from "aws-amplify";

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

  componentDidMount() {
    const gapiScript = document.createElement("script");
    gapiScript.src = "https://apis.google.com/js/api.js?onload=onGapiLoad";
    gapiScript.async = true;
    window.onGapiLoad = function onGapiLoad() {
      window.gapi.load("auth2", { callback: onAuthApiLoad });
      function onAuthApiLoad() {
        window.gapi.auth2.init({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          scope: "profile email openid"
        });
      }
    };
    document.body.appendChild(gapiScript);
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleGoogleSignIn = () => {
    const ga = window.gapi.auth2.getAuthInstance();
    ga.signIn().then(googleUser => {
      const { id_token, expires_at } = googleUser.getAuthResponse();
      const profile = googleUser.getBasicProfile();
      const user = {
        email: profile.getEmail(),
        name: profile.getName()
      };
    });
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
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            loadingText="Logging in…"
          />
          <button
            onClick={() => {
              this.handleGoogleSignIn();
            }}
          >
            Google Sign In
          </button>
        </form>
      </div>
    );
  }
}
