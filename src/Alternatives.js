import React from 'react';
import ReactFireMixin from 'reactfire';
import { Button, FormControl, Form, FormGroup, InputGroup, ControlLabel, Pager } from 'react-bootstrap';

import lowerCaseFirstLetter from './lowerCaseFirstLetter';
import disputationPropTypes from './disputationPropTypes'
import List from './List';

module.exports = React.createClass({
  mixins: [ReactFireMixin],
  propTypes: disputationPropTypes,
  getInitialState() {
    return {
      alternativeDescription: ''
    };
  },
  componentWillMount() {
    this.bindAsArray(this.props.beliefRef.child('alternatives'), 'alternatives');
  },
  render() {
    const {belief} = this.props;
    const beliefId = belief['.key'];
    const {createHref} = this.props.router;

    return(
      <div>
        <Form onSubmit={this.handleSubmit}>
          <ControlLabel>
            What alternatives are there to&nbsp;
            {lowerCaseFirstLetter(belief.description)}?
          </ControlLabel>
          <FormGroup>
            <InputGroup>
              <FormControl type='text' 
                           placeholder='Alternative' 
                           value={this.state.alternativeDescription}
                           onChange={this.handleChange}/>
              <InputGroup.Button>
                <Button type="submit" disabled={this.state.isSaving}>
                  Add
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
        </Form>
        <List value={this.state.alternatives}/>
        <Pager>
          <Pager.Item previous href={createHref(`/beliefs/${beliefId}/evidence`)}>
            &larr; Evidence
          </Pager.Item>
          <Pager.Item next href={createHref(`/beliefs/${beliefId}/implications`)}>
            Implications &rarr;
          </Pager.Item>
        </Pager>
      </div>
    );
  },
  handleChange(e) {
    e.preventDefault();
    this.setState({alternativeDescription: e.target.value});
  },
  handleSubmit(e) {
    e.preventDefault();
    this.setState({isSaving: true});

    this.firebaseRefs.alternatives.push({
      description: this.state.alternativeDescription
    }).then(() => {
      this.setState({alternativeDescription: '', isSaving: false});
    });
  }
});