import React from "react";
import ReactFireMixin from "reactfire";
import {
  Button,
  ButtonToolbar,
  FormControl,
  Form,
  FormGroup,
  InputGroup,
  ControlLabel
} from "react-bootstrap";
import Spinner from "react-spinner";
import firebase from "firebase";

import userRefFor from "./userRef";
import AdversityPanel from "./AdversityPanel";
import List from "./List";

export default React.createClass({
  mixins: [ReactFireMixin],
  propTypes: {
    user: React.PropTypes.instanceOf(firebase.User).isRequired,
    match: React.PropTypes.shape({
      params: React.PropTypes.shape({
        adversityId: React.PropTypes.string.isRequired
      }).isRequired
    })
  },
  getInitialState() {
    return {
      beliefDescription: ""
    };
  },
  componentWillMount() {
    const { adversityId } = this.props.match.params;
    const userRef = userRefFor(this.props.user);

    this.bindAsObject(
      userRef.child("adversities").child(adversityId),
      "adversity"
    );
    this.bindAsArray(
      userRef.child("beliefs").orderByChild("adversityId").equalTo(adversityId),
      "beliefs"
    );

    // Once the data has loaded for the first time, stop displaying the spinner
    Promise.all([
      this.firebaseRefs.adversity.once("value"),
      this.firebaseRefs.beliefs.once("value")
    ]).then(() => this.setState({ loaded: true }));
  },
  render() {
    const { beliefs } = this.state;

    return this.state.loaded
      ? <AdversityPanel value={this.state.adversity}>
          <Form onSubmit={this.handleSubmit}>
            <ControlLabel>
              What beliefs do I have about this adversity?
            </ControlLabel>
            <FormGroup>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="Belief"
                  value={this.state.beliefDescription}
                  onChange={this.handleChange}
                />
                <InputGroup.Button>
                  <Button type="submit" disabled={this.state.isSaving}>
                    Add
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </Form>
          <List value={beliefs} />
          {beliefs.length > 0
            ? <ButtonToolbar>
                <Button
                  href={`/beliefs/${beliefs[0][".key"]}/evidence`}
                  bsStyle="primary"
                  block
                >
                  Start Disputation
                </Button>
              </ButtonToolbar>
            : <div />}
        </AdversityPanel>
      : <Spinner />;
  },
  handleChange(e) {
    e.preventDefault();
    this.setState({ beliefDescription: e.target.value });
  },
  handleSubmit(e) {
    e.preventDefault();
    this.setState({ isSaving: true });

    this.firebaseRefs.beliefs
      .push({
        adversityId: this.state.adversity[".key"],
        description: this.state.beliefDescription
      })
      .then(() => {
        this.setState({
          beliefDescription: "",
          isSaving: false
        });
      });
  }
});
